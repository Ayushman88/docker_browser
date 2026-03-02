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
      window.open(data.novncUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "rgba(30, 41, 59, 0.8)",
          borderRadius: "16px",
          padding: "2.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h1
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.75rem",
            fontWeight: 700,
          }}
        >
          Remote Ephemeral Browser
        </h1>
        <p
          style={{
            margin: "0 0 2rem",
            color: "#94a3b8",
            fontSize: "0.95rem",
          }}
        >
          Launch an isolated Chrome session in a Docker container. Fresh
          fingerprint, auto-deleted when you close.
        </p>

        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(239, 68, 68, 0.2)",
              borderRadius: "8px",
              color: "#fca5a5",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {!sessionId ? (
            <button
              onClick={startSession}
              disabled={loading}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                background: loading ? "#475569" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Starting..." : "Start Private Browser"}
            </button>
          ) : (
            <>
              <button
                onClick={() => window.open(novncUrl, "_blank")}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Open Browser Tab
              </button>
              <button
                onClick={endSession}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: loading ? "#475569" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Ending..." : "End Session"}
              </button>
            </>
          )}
        </div>

        {sessionId && (
          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "0.85rem",
              color: "#64748b",
            }}
          >
            Session ID: <code style={{ background: "#334155", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>{sessionId}</code>
          </p>
        )}
      </div>
    </div>
  );
}
