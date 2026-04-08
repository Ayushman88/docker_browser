/**
 * Remote Ephemeral Browser - Backend API
 * Spawns isolated Chrome containers and returns noVNC URLs.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import {
  createBrowserSession,
  stopBrowserSession,
  getSessionStatus,
  listBrowserSessionsForUser,
  warmupBrowserImage,
} from "./docker.js";
import { createOtpRecord, generateOtp, signAccessToken, verifyOtp } from "./auth.js";
import { sendOtpEmail } from "./mailer.js";
import {
  apiLimiter,
  otpSendLimiter,
  otpSendPerEmailLimiter,
  otpVerifyLimiter,
  otpVerifyPerEmailLimiter,
  requireAuth,
} from "./middleware.js";
import { getMetrics, incrementMetric, logAuditEvent } from "./observability.js";
import { cleanupExpiredOtps } from "./otpStore.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : ["http://localhost:5173"] }));
app.use(express.json({ limit: "10kb" }));

setInterval(cleanupExpiredOtps, 60 * 1000);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/metrics", (_req, res) => {
  res.json(getMetrics());
});

app.post("/api/auth/send-otp", otpSendLimiter, otpSendPerEmailLimiter, async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  try {
    const otp = generateOtp();
    createOtpRecord(email, otp);
    await sendOtpEmail({ toEmail: email, otp });
    incrementMetric("otpSent");
    logAuditEvent("otp_sent", { email });
    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/api/auth/verify-otp", otpVerifyLimiter, otpVerifyPerEmailLimiter, async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const otp = String(req.body?.otp || "").trim();
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const result = verifyOtp(email, otp);
  if (!result.ok) {
    return res.status(401).json({ error: result.reason });
  }

  const accessToken = signAccessToken(email);
  incrementMetric("otpVerified");
  logAuditEvent("otp_verified", { email });
  return res.json({ accessToken, user: { email } });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: { email: req.user.email } });
});

app.get("/api/sessions", requireAuth, apiLimiter, (req, res) => {
  res.json({ sessions: listBrowserSessionsForUser(req.user.email) });
});

app.post("/api/session", requireAuth, apiLimiter, async (req, res) => {
  try {
    const session = await createBrowserSession(req.user.email);
    incrementMetric("sessionsCreated");
    logAuditEvent("session_created", { email: req.user.email, sessionId: session.sessionId });
    res.json({
      sessionId: session.sessionId,
      novncUrl: session.novncUrl,
      seleniumUrl: session.seleniumUrl,
      containerId: session.containerId,
      containerName: session.containerName,
      vncHostPort: session.vncHostPort,
      dockerImage: session.dockerImage,
    });
  } catch (err) {
    console.error("Failed to create session:", err);
    res.status(500).json({
      error: "Failed to create browser session",
    });
  }
});

app.get("/api/session/:id", requireAuth, apiLimiter, (req, res) => {
  const status = getSessionStatus(req.params.id, req.user.email);
  if (!status) {
    return res.status(404).json({ error: "Session not found" });
  }
  if (status.forbidden) {
    return res.status(403).json({ error: "Not allowed to access this session" });
  }
  res.json(status);
});

app.delete("/api/session/:id", requireAuth, apiLimiter, async (req, res) => {
  try {
    const result = await stopBrowserSession(req.params.id, req.user.email);
    if (!result.found) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (result.forbidden) {
      return res.status(403).json({ error: "Not allowed to delete this session" });
    }
    incrementMetric("sessionsDeleted");
    logAuditEvent("session_deleted", { email: req.user.email, sessionId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to stop session:", err);
    res.status(500).json({
      error: "Failed to stop browser session",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Rebrowser API running at http://localhost:${PORT}`);
  warmupBrowserImage()
    .then(() => console.log("Session browser image ready (background warmup)."))
    .catch((err) => console.warn("Session browser image warmup:", err.message));
});
