/**
 * Docker container lifecycle management for ephemeral browser sessions.
 * Uses nkpro/chrome-novnc so the browser is visible in noVNC (Selenium image
 * has a known bug where Chrome does not show in noVNC on recent versions).
 */

import Docker from "dockerode";
import { randomUUID } from "crypto";
import {
  createSession,
  getSession,
  deleteSession,
  getAllSessions,
} from "./sessionStore.js";

const docker = new Docker();

const CHROME_NOVNC_IMAGE = "nkpro/chrome-novnc:latest";
const CONTAINER_PORT = 5980; // noVNC web interface
const VNC_BASE_PORT = 5980;

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

export async function createBrowserSession() {
  const sessionId = randomUUID().slice(0, 8);
  const containerName = `rebrowser-${sessionId}`;
  const hostPort = getAvailablePort();

  try {
    const container = await docker.createContainer({
      Image: CHROME_NOVNC_IMAGE,
      Platform: "linux/amd64", // Required for Apple Silicon (M1/M2/M3)
      name: containerName,
      Env: ["RESOLUTION=1280x720x24"],
      HostConfig: {
        PortBindings: {
          [`${CONTAINER_PORT}/tcp`]: [{ HostPort: String(hostPort) }],
        },
        Memory: 512 * 1024 * 1024, // 512MB
        NanoCpus: 1e9, // 1 CPU
        ShmSize: 2 * 1024 * 1024 * 1024, // 2GB for Chrome
        AutoRemove: true,
      },
    });

    await container.start();
    createSession(sessionId, container.id, hostPort);

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
    throw err;
  }
}

export async function stopBrowserSession(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return { found: false };
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

export function getSessionStatus(sessionId) {
  const session = getSession(sessionId);
  if (!session) return null;

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
