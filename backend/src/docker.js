/**
 * Docker container lifecycle management for ephemeral browser sessions.
 * Uses nkpro/chrome-novnc so the browser is visible in noVNC (Selenium image
 * has a known bug where Chrome does not show in noVNC on recent versions).
 */

import Docker from "dockerode";
import http from "http";
import { randomUUID } from "crypto";
import {
  createSession,
  getSession,
  deleteSession,
  getAllSessions,
} from "./sessionStore.js";

const docker = new Docker();

const CHROME_NOVNC_IMAGE = process.env.CHROME_NOVNC_IMAGE || "nkpro/chrome-novnc:latest";
const CONTAINER_PORT = 5980; // noVNC web interface
const VNC_BASE_PORT = 5980;
const VNC_BIND_IP = process.env.VNC_BIND_IP || "127.0.0.1";
/** MB; Chrome starts faster with >=768MB than 512MB under load */
const CHROME_MEMORY_MB = Math.min(
  4096,
  Math.max(256, Number(process.env.CHROME_MEMORY_MB || 768)),
);
const CHROME_NANO_CPUS = Number(process.env.CHROME_NANO_CPUS || 2e9);
const NOVNC_READY_WAIT = String(process.env.NOVNC_READY_WAIT || "false").toLowerCase() === "true";
const NOVNC_READY_TIMEOUT_MS = Number(process.env.NOVNC_READY_TIMEOUT_MS || 120000);
const NOVNC_READY_POLL_MS = Number(process.env.NOVNC_READY_POLL_MS || 400);
/** Where the API process can reach the host-mapped noVNC port (host: 127.0.0.1, API in Docker Desktop: host.docker.internal) */
const NOVNC_READY_HOST = process.env.NOVNC_READY_HOST || "127.0.0.1";

// Track which ports are in use
const usedPorts = new Set();

function getAvailablePort() {
  let port = VNC_BASE_PORT;
  let offset = 0;
  while (usedPorts.has(port)) {
    offset++;
    port = VNC_BASE_PORT + offset;
  }
  usedPorts.add(port);
  return port;
}

function releasePort(port) {
  usedPorts.delete(port);
}

function pullImage(imageName) {
  return new Promise((resolve, reject) => {
    docker.pull(imageName, (pullErr, stream) => {
      if (pullErr) {
        reject(pullErr);
        return;
      }
      docker.modem.followProgress(stream, (progressErr) => {
        if (progressErr) {
          reject(progressErr);
          return;
        }
        resolve();
      });
    });
  });
}

async function ensureImagePresent(imageName) {
  try {
    await docker.getImage(imageName).inspect();
  } catch (err) {
    if (err?.statusCode === 404) {
      await pullImage(imageName);
      return;
    }
    throw err;
  }
}

/** Pull session image early so the first user is not blocked on download. */
export function warmupBrowserImage() {
  return ensureImagePresent(CHROME_NOVNC_IMAGE);
}

function novncHttpReachable(host, port, pathname) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host,
        port,
        path: pathname,
        method: "GET",
        timeout: 2500,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      },
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitUntilNovncListening(hostPort) {
  const deadline = Date.now() + NOVNC_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await novncHttpReachable(NOVNC_READY_HOST, hostPort, "/vnc.html")) {
      return;
    }
    await new Promise((r) => setTimeout(r, NOVNC_READY_POLL_MS));
  }
  throw new Error(
    `noVNC did not become ready within ${NOVNC_READY_TIMEOUT_MS}ms (probe ${NOVNC_READY_HOST}:${hostPort}).`,
  );
}

export async function createBrowserSession(ownerEmail) {
  const sessionId = randomUUID().slice(0, 8);
  const containerName = `rebrowser-${sessionId}`;
  const hostPort = getAvailablePort();

  try {
    await ensureImagePresent(CHROME_NOVNC_IMAGE);
    const container = await docker.createContainer({
      Image: CHROME_NOVNC_IMAGE,
      Platform: "linux/amd64", // Required for Apple Silicon (M1/M2/M3)
      name: containerName,
      Env: ["RESOLUTION=1280x720x24"],
      HostConfig: {
        PortBindings: {
          [`${CONTAINER_PORT}/tcp`]: [
            {
              HostIp: VNC_BIND_IP,
              HostPort: String(hostPort),
            },
          ],
        },
        Memory: CHROME_MEMORY_MB * 1024 * 1024,
        NanoCpus: CHROME_NANO_CPUS,
        ShmSize: 2 * 1024 * 1024 * 1024, // 2GB for Chrome
        AutoRemove: true,
      },
    });

    await container.start();
    if (NOVNC_READY_WAIT) {
      await waitUntilNovncListening(hostPort);
    }
    createSession(sessionId, container.id, hostPort, ownerEmail);

    const host = process.env.VNC_HOST || "localhost";
    const novncUrl = `http://${host}:${hostPort}/vnc.html`;

    return {
      sessionId,
      novncUrl,
      seleniumUrl: null,
      containerId: container.id,
    };
  } catch (err) {
    releasePort(hostPort);
    if (err?.statusCode === 404 && String(err?.json?.message || "").includes("No such image")) {
      err.message = `Browser image not available: ${CHROME_NOVNC_IMAGE}. Ensure Docker can pull this image.`;
    }
    throw err;
  }
}

export async function stopBrowserSession(sessionId, requesterEmail) {
  const session = getSession(sessionId);
  if (!session) {
    return { found: false };
  }
  if (requesterEmail && session.ownerEmail !== requesterEmail.toLowerCase()) {
    return { found: true, forbidden: true };
  }

  try {
    const container = docker.getContainer(session.containerId);
    await container.stop({ t: 5 });
  } catch (err) {
    // Container may already be stopped/removed
    if (err.statusCode !== 304 && err.statusCode !== 404) {
      throw err;
    }
  } finally {
    releasePort(session.vncPort);
    deleteSession(sessionId);
  }

  return { found: true };
}

export function getSessionStatus(sessionId, requesterEmail) {
  const session = getSession(sessionId);
  if (!session) return null;
  if (requesterEmail && session.ownerEmail !== requesterEmail.toLowerCase()) {
    return { forbidden: true };
  }

  const host = process.env.VNC_HOST || "localhost";
  const novncUrl = `http://${host}:${session.vncPort}/vnc.html`;

  return {
    sessionId,
    novncUrl,
    seleniumUrl: null,
    containerId: session.containerId,
  };
}

export { getAllSessions };
