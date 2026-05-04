// index.js
// Server entry point
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌱 Smart Agriculture API running on port ${PORT}`);
  console.log(`   Health check:     http://localhost:${PORT}/api/v1/health`);
  console.log(`   Diagnose:         http://localhost:${PORT}/api/v1/diagnose`);
  console.log(`   Sensor Analysis:  http://localhost:${PORT}/api/v1/sensor-analysis`);
});
