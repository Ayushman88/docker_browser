/**
 * In-memory session store for tracking active browser containers.
 * Maps sessionId -> { containerId, vncPort, ownerEmail, createdAt }
 */

const sessions = new Map();

export function createSession(sessionId, containerId, vncPort, ownerEmail) {
  sessions.set(sessionId, {
    containerId,
    vncPort,
    ownerEmail: ownerEmail?.toLowerCase() || null,
    createdAt: Date.now(),
  });
}

export function getSession(sessionId) {
  return sessions.get(sessionId);
}

export function deleteSession(sessionId) {
  const session = sessions.get(sessionId);
  sessions.delete(sessionId);
  return session;
}

export function getAllSessions() {
  return Object.fromEntries(sessions);
}
