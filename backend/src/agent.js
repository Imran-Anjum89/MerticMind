/**
 * MetricMind - Conversational BI Agent
 *
 * Purpose:
 * Convert natural-language business questions into
 * governed Cube.dev JSON query requests.
 *
 * The agent does NOT generate raw SQL.
 */

const SUPPORTED_REGIONS = [
  "Europe",
  "North America",
  "India",
  "Japan",
];

const MEASURES = {
  revenue: "Sales.revenue",
  cost: "Sales.cost",
  profit: "Sales.profit",
  margin: "Sales.margin",
  shippingcost: "Sales.shippingCost",
  materialcost: "Sales.materialCost",
};

const DIMENSIONS = {
  region: "Sales.region",
  country: "Sales.country",
  productcategory: "Sales.productCategory",
  date: "Sales.date",
};

/**
 * Detect the region mentioned in a user question.
 */
function detectRegion(question) {
  const normalized = question.toLowerCase();

  return (
    SUPPORTED_REGIONS.find((region) =>
      normalized.includes(region.toLowerCase())
    ) || null
  );
}

/**
 * Detect the business measure requested by the user.
 */
function detectMeasures(question) {
  const normalized = question.toLowerCase();
  const measures = [];

  if (normalized.includes("revenue") || normalized.includes("sales")) {
    measures.push(MEASURES.revenue);
  }

  if (normalized.includes("cost")) {
    measures.push(MEASURES.cost);
  }

  if (normalized.includes("profit")) {
    measures.push(MEASURES.profit);
  }

  if (normalized.includes("margin")) {
    measures.push(MEASURES.margin);
  }

  if (normalized.includes("shipping")) {
    measures.push(MEASURES.shippingcost);
  }

  if (normalized.includes("material")) {
    measures.push(MEASURES.materialcost);
  }

  // Default metric for general business questions.
  if (measures.length === 0) {
    measures.push(MEASURES.revenue);
  }

  return [...new Set(measures)];
}

/**
 * Detect whether the question asks for a trend.
 */
function isTrendQuestion(question) {
  const normalized = question.toLowerCase();

  return [
    "trend",
    "over time",
    "monthly",
    "quarterly",
    "last quarter",
    "previous quarter",
    "growth",
  ].some((keyword) => normalized.includes(keyword));
}

/**
 * Detect whether the question requires a breakdown.
 */
function isBreakdownQuestion(question) {
  const normalized = question.toLowerCase();

  return [
    "breakdown",
    "by region",
    "by country",
    "by product",
    "by category",
    "compare",
    "comparison",
  ].some((keyword) => normalized.includes(keyword));
}

/**
 * Build a governed Cube.dev query.
 *
 * IMPORTANT:
 * This function only creates Cube JSON.
 * It never creates raw SQL.
 */
function buildCubeQuery(question) {
  const region = detectRegion(question);
  const measures = detectMeasures(question);

  const query = {
    measures,
    dimensions: [],
    timeDimensions: [],
    filters: [],
    limit: 1000,
  };

  // Region filter
  if (region) {
    query.filters.push({
      member: DIMENSIONS.region,
      operator: "equals",
      values: [region],
    });
  }

  // Trend analysis
  if (isTrendQuestion(question)) {
    query.timeDimensions.push({
      dimension: DIMENSIONS.date,
      granularity: "quarter",
    });
  }

  // Breakdown analysis
  if (isBreakdownQuestion(question)) {
    if (question.toLowerCase().includes("country")) {
      query.dimensions.push(DIMENSIONS.country);
    } else if (
      question.toLowerCase().includes("product") ||
      question.toLowerCase().includes("category")
    ) {
      query.dimensions.push(DIMENSIONS.productcategory);
    } else {
      query.dimensions.push(DIMENSIONS.region);
    }
  }

  return query;
}

/**
 * Identify whether a question requires multi-step investigation.
 *
 * Example:
 * "Why did European margins drop last quarter?"
 *
 * Step 1:
 * Investigate margin trend.
 *
 * Step 2:
 * Investigate shipping and material costs.
 */
function requiresRootCauseAnalysis(question) {
  const normalized = question.toLowerCase();

  return (
    normalized.includes("why") ||
    normalized.includes("drop") ||
    normalized.includes("decrease") ||
    normalized.includes("decline") ||
    normalized.includes("increase") ||
    normalized.includes("change")
  );
}

/**
 * Create the analytical plan for the AI agent.
 */
function createAnalysisPlan(question) {
  const region = detectRegion(question);

  if (!requiresRootCauseAnalysis(question)) {
    return {
      type: "single_step",
      queries: [
        {
          step: 1,
          purpose: "Answer the business question",
          cubeQuery: buildCubeQuery(question),
        },
      ],
    };
  }

  const primaryQuery = buildCubeQuery(
    `${question} margin trend quarterly`
  );

  const secondaryQuery = {
    measures: [
      MEASURES.shippingcost,
      MEASURES.materialcost,
    ],
    dimensions: [],
    timeDimensions: [
      {
        dimension: DIMENSIONS.date,
        granularity: "quarter",
      },
    ],
    filters: region
      ? [
          {
            member: DIMENSIONS.region,
            operator: "equals",
            values: [region],
          },
        ]
      : [],
    limit: 1000,
  };

  return {
    type: "root_cause_analysis",
    queries: [
      {
        step: 1,
        purpose: "Analyze margin trend",
        cubeQuery: primaryQuery,
      },
      {
        step: 2,
        purpose: "Break down shipping and material costs",
        cubeQuery: secondaryQuery,
      },
    ],
  };
}

/**
 * Main MetricMind agent entry point.
 */
async function runAgent(question) {
  if (!question || typeof question !== "string") {
    throw new Error("A natural-language business question is required.");
  }

  const analysisPlan = createAnalysisPlan(question);

  return {
    question,
    governed: true,
    rawSqlGenerated: false,
    semanticLayer: "Cube.dev",
    analysisPlan,
  };
}

module.exports = {
  runAgent,
  buildCubeQuery,
  createAnalysisPlan,
  detectRegion,
  detectMeasures,
};