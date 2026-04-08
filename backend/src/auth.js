import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getOtp, setOtp, deleteOtp } from "./otpStore.js";

const OTP_TTL_MS = Number(process.env.OTP_TTL_MS || 5 * 60 * 1000);
const MAX_OTP_ATTEMPTS = Number(process.env.MAX_OTP_ATTEMPTS || 5);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_ISSUER = process.env.JWT_ISSUER || "rebrowser-api";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "rebrowser-client";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return secret;
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createOtpRecord(email, otp) {
  const now = Date.now();
  setOtp(email, {
    otpHash: hashOtp(otp),
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    createdAt: now,
  });
}

export function verifyOtp(email, otp) {
  const record = getOtp(email);
  if (!record) {
    return { ok: false, reason: "No OTP requested for this email." };
  }

  if (Date.now() > record.expiresAt) {
    deleteOtp(email);
    return { ok: false, reason: "OTP expired. Please request a new OTP." };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    deleteOtp(email);
    return { ok: false, reason: "Too many failed attempts. Request a new OTP." };
  }

  const isMatch = hashOtp(otp) === record.otpHash;
  if (!isMatch) {
    setOtp(email, { ...record, attempts: record.attempts + 1 });
    return { ok: false, reason: "Invalid OTP." };
  }

  deleteOtp(email);
  return { ok: true };
}

export function signAccessToken(email) {
  return jwt.sign(
    {
      sub: email.toLowerCase(),
      email: email.toLowerCase(),
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
    },
    getJwtSecret(),
    { algorithm: "HS256", expiresIn: JWT_EXPIRES_IN },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}
