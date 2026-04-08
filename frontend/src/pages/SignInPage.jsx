import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function SignInPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (ready && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function sendOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to send OTP");
      setOtpSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to verify OTP");
      login(data.accessToken, data.user.email);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-inspo">
      <div className="auth-inspo-bg" aria-hidden />
      <div className="auth-inspo-card">
        <Link to="/" className="auth-inspo-back">
          ← Back home
        </Link>
        <div className="auth-inspo-head">
          <span className="auth-inspo-badge">Secure sign-in</span>
          <h1 className="auth-inspo-title">Welcome back</h1>
          <p className="auth-inspo-sub">We will email you a one-time code—no password to store.</p>
        </div>

        <label className="field-pro-label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          className="field-pro"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {otpSent && (
          <>
            <label className="field-pro-label" htmlFor="otp">
              One-time code
            </label>
            <input
              id="otp"
              className="field-pro"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </>
        )}

        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="auth-inspo-actions">
          {!otpSent ? (
            <button type="button" className="btn btn-ink btn-block btn-lg btn-pill" disabled={loading || !email} onClick={sendOtp}>
              {loading ? "Sending…" : "Email me a code"}
              {!loading && (
                <span className="btn-arrow" aria-hidden>
                  →
                </span>
              )}
            </button>
          ) : (
            <button type="button" className="btn btn-ink btn-block btn-lg btn-pill" disabled={loading || !otp} onClick={verifyOtp}>
              {loading ? "Verifying…" : "Verify and continue"}
              {!loading && (
                <span className="btn-arrow" aria-hidden>
                  →
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
