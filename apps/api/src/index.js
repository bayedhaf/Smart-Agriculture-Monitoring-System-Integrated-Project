// src/index.js
// Express server entry point
"use strict";

const express = require("express");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// AI diagnosis route
app.use("/api/v1/diagnose", aiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Endpoint not found." } });
});

// Only start the server when this file is run directly (not when imported in tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Smart Agriculture API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
