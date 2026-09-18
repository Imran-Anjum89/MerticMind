/**
 * MetricMind - Cube Configuration
 *
 * Configures the Cube.dev semantic layer entry point.
 */

module.exports = {
  schemaPath: "model/cubes",
  apiSecret: process.env.CUBEJS_API_SECRET || "metricmind-development-secret",
};