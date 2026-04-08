import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [authEmail, setAuthEmail] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [novncUrl, setNovncUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("rebrowser_access_token");
    const savedEmail = localStorage.getItem("rebrowser_auth_email");
    if (savedToken && savedEmail) {
      setAccessToken(savedToken);
      setAuthEmail(savedEmail);
      setEmail(savedEmail);
    }
  }, []);

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
      setError(err.message || "An unexpected error occurred.");
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
      setAccessToken(data.accessToken);
      setAuthEmail(data.user.email);
      localStorage.setItem("rebrowser_access_token", data.accessToken);
      localStorage.setItem("rebrowser_auth_email", data.user.email);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAccessToken(null);
    setAuthEmail(null);
    setSessionId(null);
    setNovncUrl(null);
    setOtp("");
    setOtpSent(false);
    localStorage.removeItem("rebrowser_access_token");
    localStorage.removeItem("rebrowser_auth_email");
  }

  async function startSession() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create session");
      }

      setSessionId(data.sessionId);
      setNovncUrl(data.novncUrl);
      
      // Attempt to open immediately; some browsers might block this if not triggered strictly by a user event
      window.open(data.novncUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/session/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to end session");
      }

      setSessionId(null);
      setNovncUrl(null);
    } catch (err) {
      setError(err.message || "Failed to terminate the session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Remote Ephemeral Browser</h1>
        <p className="subtitle">
          Launch an isolated Chrome session in a Docker container. Fresh
          fingerprint, auto-deleted when you close.
        </p>

        {!accessToken && (
          <div className="session-info" style={{ marginBottom: "16px" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            {otpSent && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />
            )}
            <div className="button-group">
              {!otpSent ? (
                <button onClick={sendOtp} disabled={loading || !email} className="btn btn-primary">
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <button onClick={verifyOtp} disabled={loading || !otp} className="btn btn-success">
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              )}
            </div>
          </div>
        )}

        {accessToken && (
          <div className="session-info">
            Signed in as <code className="code-snippet">{authEmail}</code>
            <div style={{ marginTop: "10px" }}>
              <button onClick={logout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="button-group">
          {!sessionId ? (
            <button
              onClick={startSession}
              disabled={loading || !accessToken}
              className="btn btn-primary"
            >
              {loading ? "Starting..." : "🚀 Start Private Browser"}
            </button>
          ) : (
            <>
              <button
                onClick={() => window.open(novncUrl, "_blank", "noopener,noreferrer")}
                className="btn btn-success"
              >
                🌐 Open Browser Tab
              </button>
              <button
                onClick={endSession}
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? "Ending..." : "⏹ End Session"}
              </button>
            </>
          )}
        </div>

        {sessionId && (
          <div className="session-info">
            Session ID: <code className="code-snippet">{sessionId}</code>
          </div>
        )}
      </div>
    </div>
  );
}
