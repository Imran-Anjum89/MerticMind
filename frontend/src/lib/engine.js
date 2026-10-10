/**
 * Universal backend engine bridge for local development, monorepo, and Vercel serverless deployments.
 */
let semanticEngine;
let agent;

try {
  // 1. Try monorepo root path
  semanticEngine = require('../../../backend/src/semanticEngine');
} catch (e1) {
  try {
    // 2. Try frontend-local backend copy
    semanticEngine = require('../../backend/src/semanticEngine');
  } catch (e2) {
    console.error('[Engine Bridge] Failed to load semanticEngine:', e1, e2);
    throw e1;
  }
}

try {
  agent = require('../../../backend/src/agent');
} catch (e1) {
  try {
    agent = require('../../backend/src/agent');
  } catch (e2) {
    console.error('[Engine Bridge] Failed to load agent:', e1, e2);
    throw e1;
  }
}

module.exports = {
  ...semanticEngine,
  processUserQuestion: agent ? agent.processUserQuestion : null
};
