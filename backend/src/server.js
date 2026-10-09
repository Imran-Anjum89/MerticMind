const http = require('http');
const { initWarehouse, getCubeSchema, getWarehouseHealth } = require('./semanticEngine');
const { processUserQuestion } = require('./agent');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Initialize SQLite warehouse and dbt views
  console.log('[MetricMind Backend] Initializing warehouse & dbt models...');
  await initWarehouse();
  console.log('[MetricMind Backend] ✅ Warehouse ready.');

  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // GET /health or /api/health
    if (req.method === 'GET' && (pathname === '/health' || pathname === '/api/health')) {
      try {
        const health = await getWarehouseHealth();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health, null, 2));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: err.message }));
      }
      return;
    }

    // GET /schema or /api/schema
    if (req.method === 'GET' && (pathname === '/schema' || pathname === '/api/schema')) {
      try {
        const schema = getCubeSchema();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(schema, null, 2));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // POST /agent or /api/agent
    if (req.method === 'POST' && (pathname === '/agent' || pathname === '/api/agent')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const question = parsed.question?.trim() || 'Why did European margins drop last quarter?';
          console.log(`[MetricMind Backend] Processing query: "${question}"`);

          const result = await processUserQuestion(question);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err) {
          const isGov = err.message && err.message.includes('GOVERNANCE');
          res.writeHead(isGov ? 403 : 500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: err.message || 'Error processing agent query',
            scenario: 'ERROR'
          }));
        }
      });
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found', available: ['/health', '/schema', '/agent'] }));
  });

  server.listen(PORT, () => {
    console.log(`╔══════════════════════════════════════════════════════════╗`);
    console.log(`║  MetricMind Backend API Server                          ║`);
    console.log(`║  Running on: http://localhost:${PORT}                      ║`);
    console.log(`║  Endpoints:                                              ║`);
    console.log(`║    - GET  http://localhost:${PORT}/health                  ║`);
    console.log(`║    - GET  http://localhost:${PORT}/schema                  ║`);
    console.log(`║    - POST http://localhost:${PORT}/agent                   ║`);
    console.log(`╚══════════════════════════════════════════════════════════╝`);
  });
}

startServer().catch(err => {
  console.error('[MetricMind Backend] Failed to start:', err);
  process.exit(1);
});
