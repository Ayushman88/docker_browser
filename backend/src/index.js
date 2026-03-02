/**
 * Remote Ephemeral Browser - Backend API
 * Spawns isolated Chrome containers and returns noVNC URLs.
 */

import express from "express";
import cors from "cors";
import {
  createBrowserSession,
  stopBrowserSession,
  getSessionStatus,
} from "./docker.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/session", async (req, res) => {
  try {
    const session = await createBrowserSession();
    res.json({
      sessionId: session.sessionId,
      novncUrl: session.novncUrl,
      seleniumUrl: session.seleniumUrl,
    });
  } catch (err) {
    console.error("Failed to create session:", err);
    res.status(500).json({
      error: "Failed to create browser session",
      message: err.message,
    });
  }
});

app.get("/api/session/:id", (req, res) => {
  const status = getSessionStatus(req.params.id);
  if (!status) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(status);
});

app.delete("/api/session/:id", async (req, res) => {
  try {
    const result = await stopBrowserSession(req.params.id);
    if (!result.found) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to stop session:", err);
    res.status(500).json({
      error: "Failed to stop browser session",
      message: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Rebrowser API running at http://localhost:${PORT}`);
});
