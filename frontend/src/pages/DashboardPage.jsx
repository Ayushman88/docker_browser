import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function shortenId(id) {
  if (!id || id.length < 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function DashboardPage() {
  const { token, email, ready, logout, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const refreshSessions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/sessions`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load sessions");
      setSessions(data.sessions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) refreshSessions();
  }, [token, refreshSessions]);

  async function startSession() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/session`, { method: "POST", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to start session");
      await refreshSessions();
      window.open(data.novncUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function endSession(sessionId) {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/session/${sessionId}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to end session");
      await refreshSessions();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="dash-loading">
        <div className="spinner-light" aria-hidden />
        <p>Loading console…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="dash-app">
      <div className="dash-bg" aria-hidden />

      <header className="dash-top shell-wide-dash">
        <div className="dash-top-inner">
          <div className="dash-top-left">
            <Link to="/" className="brand-light brand-light--sm">
              <span className="brand-light-mark" aria-hidden />
              <span className="brand-light-text">Rebrowser</span>
            </Link>
            <span className="dash-badge">Console</span>
          </div>
          <div className="dash-top-right">
            <div className="dash-search-pill" title={email}>
              <span className="dash-search-icon" aria-hidden />
              <span className="dash-email">{email}</span>
            </div>
            <button type="button" className="btn btn-outline btn-sm btn-pill" onClick={() => logout()}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="dash-layout shell-wide-dash">
        <aside className="dash-side">
          <p className="dash-side-title">Shortcuts</p>
          <button type="button" className="btn btn-ink btn-block btn-pill" disabled={busy} onClick={startSession}>
            {busy ? "Working…" : "+ New browser session"}
          </button>
          <button type="button" className="btn btn-outline btn-block btn-pill" disabled={loading} onClick={refreshSessions}>
            {loading ? "Refreshing…" : "Refresh list"}
          </button>
          <nav className="dash-side-nav">
            <Link to="/" className="dash-side-link">
              ← Back to marketing site
            </Link>
          </nav>
          <p className="dash-side-foot">
            Streams use <strong>noVNC</strong>. Containers use the pattern <code className="mono-inline">rebrowser-&lt;id&gt;</code>.
          </p>
        </aside>

        <main className="dash-main-panel">
          <div className="dash-panel-header">
            <div>
              <h1 className="dash-panel-title">App sessions</h1>
              <p className="dash-panel-desc">Live Docker containers you own. Open noVNC or end a session to free the host port.</p>
            </div>
            <div className="dash-panel-stat">
              <span className="dash-panel-stat-label">Active</span>
              <span className="dash-panel-stat-value">{sessions.length}</span>
            </div>
          </div>

          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="empty-panel">
              <div className="empty-panel-icon" aria-hidden />
              <h2>No active sessions</h2>
              <p>Use <strong>New browser session</strong> in the sidebar. The first launch can take a little while while the image is ready.</p>
            </div>
          )}

          {sessions.length > 0 && (
            <div className="table-surface">
              <table className="table-pro">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Container</th>
                    <th>Docker ID</th>
                    <th>Port</th>
                    <th>Image</th>
                    <th>Started</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.sessionId}>
                      <td>
                        <code className="mono">{s.sessionId}</code>
                      </td>
                      <td>
                        <code className="mono text-soft">{s.containerName}</code>
                      </td>
                      <td>
                        <code className="mono" title={s.containerId}>
                          {shortenId(s.containerId)}
                        </code>
                      </td>
                      <td>
                        <span className="pill-port">{s.vncHostPort}</span>
                      </td>
                      <td className="td-clip text-soft" title={s.dockerImage}>
                        {s.dockerImage?.split("/").pop() || "—"}
                      </td>
                      <td className="text-soft">{formatTime(s.createdAt)}</td>
                      <td className="td-actions">
                        <a className="btn btn-outline btn-sm btn-pill" href={s.novncUrl} target="_blank" rel="noreferrer">
                          Open noVNC
                        </a>
                        <button type="button" className="btn btn-danger-soft btn-sm btn-pill" disabled={busy} onClick={() => endSession(s.sessionId)}>
                          End
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
