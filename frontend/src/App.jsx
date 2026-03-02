import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [novncUrl, setNovncUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function startSession() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="button-group">
          {!sessionId ? (
            <button
              onClick={startSession}
              disabled={loading}
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
