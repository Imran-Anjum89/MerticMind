/**
 * MetricMind - Backend API
 *
 * Connects the conversational agent with the
 * governed semantic engine.
 */

const http = require("http");

const { runAgent } = require("./agent");
const {
  executeCubeQuery,
} = require("./semanticEngine");

const PORT = process.env.PORT || 3001;

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  response.end(JSON.stringify(data));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Request body must contain valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

async function handleAgentRequest(request, response) {
  try {
    const body = await readRequestBody(request);
    const question = body.question;

    if (!question || typeof question !== "string") {
      return sendJson(response, 400, {
        error: "A natural-language business question is required.",
      });
    }

    const agentResult = await runAgent(question);

    const queryResults = [];

    for (const plannedQuery of agentResult.analysisPlan.queries) {
      const cubeQuery = plannedQuery.cubeQuery;

      try {
        const result = await executeCubeQuery(cubeQuery);

        queryResults.push({
          step: plannedQuery.step,
          purpose: plannedQuery.purpose,
          cubeQuery,
          result,
        });
      } catch (error) {
        queryResults.push({
          step: plannedQuery.step,
          purpose: plannedQuery.purpose,
          cubeQuery,
          error: error.message,
        });
      }
    }

    return sendJson(response, 200, {
      question: agentResult.question,
      governed: agentResult.governed,
      rawSqlGenerated: agentResult.rawSqlGenerated,
      semanticLayer: agentResult.semanticLayer,
      analysisPlan: agentResult.analysisPlan,
      queryResults,
    });
  } catch (error) {
    return sendJson(response, 500, {
      error: error.message,
    });
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    return response.end();
  }

  if (
    request.method === "POST" &&
    request.url === "/api/agent"
  ) {
    return handleAgentRequest(request, response);
  }

  if (
    request.method === "GET" &&
    request.url === "/health"
  ) {
    return sendJson(response, 200, {
      status: "ok",
      service: "MetricMind Backend",
    });
  }

  return sendJson(response, 404, {
    error: "Route not found.",
  });
});

server.listen(PORT, () => {
  console.log(
    `MetricMind backend running on http://localhost:${PORT}`
  );
});