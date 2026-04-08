import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
const AUDIT_LOG_FILE = path.join(DATA_DIR, "audit.log");

const metrics = {
  otpSent: 0,
  otpVerified: 0,
  sessionsCreated: 0,
  sessionsDeleted: 0,
};

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
}

export function incrementMetric(name) {
  if (metrics[name] !== undefined) {
    metrics[name] += 1;
  }
}

export function getMetrics() {
  return { ...metrics, uptimeSeconds: Math.floor(process.uptime()) };
}

export function logAuditEvent(event, details = {}) {
  ensureDataDir();
  const safeDetails = { ...details };
  if (safeDetails.email) {
    safeDetails.emailHash = crypto
      .createHash("sha256")
      .update(String(safeDetails.email).toLowerCase())
      .digest("hex")
      .slice(0, 12);
    delete safeDetails.email;
  }
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    event,
    ...safeDetails,
  });
  fs.appendFileSync(AUDIT_LOG_FILE, `${line}\n`, { mode: 0o600 });
  console.log(line);
}
