import rateLimit from "express-rate-limit";
import { verifyAccessToken } from "./auth.js";

function perEmailLimiter(windowMs, max) {
  const buckets = new Map();
  return (req, res, next) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return next();
    const now = Date.now();
    const bucket = buckets.get(email) || { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(email, bucket);
    if (bucket.count > max) {
      return res.status(429).json({ error: "Too many requests for this email. Try later." });
    }
    next();
  };
}

export const otpSendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.OTP_SEND_LIMIT_PER_MIN || 3),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP requests. Try again in a minute." },
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.OTP_VERIFY_LIMIT_PER_MIN || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts. Try again in a minute." },
});

export const otpSendPerEmailLimiter = perEmailLimiter(
  60 * 1000,
  Number(process.env.OTP_SEND_LIMIT_PER_MIN_EMAIL || 3),
);

export const otpVerifyPerEmailLimiter = perEmailLimiter(
  60 * 1000,
  Number(process.env.OTP_VERIFY_LIMIT_PER_MIN_EMAIL || 8),
);

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.API_LIMIT_PER_MIN || 30),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.email || req.ip,
  message: { error: "Rate limit exceeded. Slow down and try again." },
});

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
