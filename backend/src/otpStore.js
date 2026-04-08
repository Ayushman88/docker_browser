import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
const OTP_FILE = path.join(DATA_DIR, "otp-store.json");

const otpMap = new Map();

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
}

function persist() {
  ensureDataDir();
  fs.writeFileSync(OTP_FILE, JSON.stringify(Object.fromEntries(otpMap), null, 2), {
    mode: 0o600,
  });
}

function loadFromDisk() {
  try {
    ensureDataDir();
    if (!fs.existsSync(OTP_FILE)) return;
    const raw = fs.readFileSync(OTP_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    for (const [email, entry] of Object.entries(parsed)) {
      otpMap.set(email, entry);
    }
  } catch {
    // Ignore malformed file on boot and continue with empty store.
  }
}

loadFromDisk();

export function cleanupExpiredOtps() {
  const now = Date.now();
  let changed = false;
  for (const [email, entry] of otpMap.entries()) {
    if (!entry?.expiresAt || now > entry.expiresAt) {
      otpMap.delete(email);
      changed = true;
    }
  }
  if (changed) persist();
}

export function setOtp(email, entry) {
  cleanupExpiredOtps();
  otpMap.set(email.toLowerCase(), entry);
  persist();
}

export function getOtp(email) {
  return otpMap.get(email.toLowerCase()) || null;
}

export function deleteOtp(email) {
  otpMap.delete(email.toLowerCase());
  persist();
}
