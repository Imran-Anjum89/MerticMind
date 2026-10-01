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

const MEASURES = Object.freeze({
  revenue: "Sales.revenue",
  cost: "Sales.cost",
  profit: "Sales.profit",
  margin: "Sales.margin",
  shippingcost: "Sales.shippingCost",
  materialcost: "Sales.materialCost",
});

const DIMENSIONS = Object.freeze({
  region: "Sales.region",
  country: "Sales.country",
  productcategory: "Sales.productCategory",
  date: "Sales.date",
});

const ALLOWED_MEASURES = new Set(Object.values(MEASURES));
const ALLOWED_DIMENSIONS = new Set(Object.values(DIMENSIONS));

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
 * Detect the business measures requested by the user.
 *
 * Specific cost types are checked before generic cost.
 */
function detectMeasures(question) {
  const normalized = question.toLowerCase();
  const measures = [];

  const hasShippingCost = normalized.includes("shipping");
  const hasMaterialCost = normalized.includes("material");

  if (normalized.includes("revenue") || normalized.includes("sales")) {
    measures.push(MEASURES.revenue);
  }

  if (normalized.includes("profit")) {
    measures.push(MEASURES.profit);
  }

  if (normalized.includes("margin")) {
    measures.push(MEASURES.margin);
  }

  if (hasShippingCost) {
    measures.push(MEASURES.shippingcost);
  }

  if (hasMaterialCost) {
    measures.push(MEASURES.materialcost);
  }

  if (
    normalized.includes("cost") &&
    !hasShippingCost &&
    !hasMaterialCost
  ) {
    measures.push(MEASURES.cost);
  }

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
    "decline",
    "drop",
    "increase",
    "change",
  ].some((keyword) => normalized.includes(keyword));
}

/**
 * Detect the requested time granularity.
 */
function detectGranularity(question) {
  const normalized = question.toLowerCase();

  if (
    normalized.includes("monthly") ||
    normalized.includes("month")
  ) {
    return "month";
  }

  if (
    normalized.includes("quarterly") ||
    normalized.includes("quarter")
  ) {
    return "quarter";
  }

  if (
    normalized.includes("yearly") ||
    normalized.includes("annual") ||
    normalized.includes("year")
  ) {
    return "year";
  }

  return "quarter";
}

/**
 * Detect whether the question requires a dimension breakdown.
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
 * Detect the requested breakdown dimension.
 */
function detectBreakdownDimension(question) {
  const normalized = question.toLowerCase();

  if (
    normalized.includes("country") ||
    normalized.includes("countries")
  ) {
    return DIMENSIONS.country;
  }

  if (
    normalized.includes("product") ||
    normalized.includes("category")
  ) {
    return DIMENSIONS.productcategory;
  }

  if (
    normalized.includes("region") ||
    normalized.includes("regional")
  ) {
    return DIMENSIONS.region;
  }

  return DIMENSIONS.region;
}

/**
 * Detect whether a time comparison is requested.
 */
function detectTimeFilter(question) {
  const normalized = question.toLowerCase();

  if (normalized.includes("last quarter")) {
    return {
      dimension: DIMENSIONS.date,
      dateRange: "last quarter",
    };
  }

  if (normalized.includes("previous quarter")) {
    return {
      dimension: DIMENSIONS.date,
      dateRange: "previous quarter",
    };
  }

  return null;
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

  if (region) {
    query.filters.push({
      member: DIMENSIONS.region,
      operator: "equals",
      values: [region],
    });
  }

  if (isTrendQuestion(question)) {
    const timeDimension = {
      dimension: DIMENSIONS.date,
      granularity: detectGranularity(question),
    };

    const timeFilter = detectTimeFilter(question);

    if (timeFilter) {
      timeDimension.dateRange = timeFilter.dateRange;
    }

    query.timeDimensions.push(timeDimension);
  }

  if (isBreakdownQuestion(question)) {
    query.dimensions.push(
      detectBreakdownDimension(question)
    );
  }

  return query;
}

/**
 * Validate that a generated Cube query only uses
 * governed measures and dimensions.
 */
function validateGovernedQuery(query) {
  if (!query || typeof query !== "object") {
    throw new Error("Invalid Cube query.");
  }

  if (!Array.isArray(query.measures)) {
    throw new Error("Cube query measures must be an array.");
  }

  if (!Array.isArray(query.dimensions)) {
    throw new Error("Cube query dimensions must be an array.");
  }

  if (!Array.isArray(query.timeDimensions)) {
    throw new Error("Cube query timeDimensions must be an array.");
  }

  if (!Array.isArray(query.filters)) {
    throw new Error("Cube query filters must be an array.");
  }

  for (const measure of query.measures) {
    if (!ALLOWED_MEASURES.has(measure)) {
      throw new Error(`Ungoverned measure: ${measure}`);
    }
  }

  for (const dimension of query.dimensions) {
    if (!ALLOWED_DIMENSIONS.has(dimension)) {
      throw new Error(`Ungoverned dimension: ${dimension}`);
    }
  }

  for (const timeDimension of query.timeDimensions) {
    if (!ALLOWED_DIMENSIONS.has(timeDimension.dimension)) {
      throw new Error(
        `Ungoverned time dimension: ${timeDimension.dimension}`
      );
    }
  }

  for (const filter of query.filters) {
    if (!ALLOWED_DIMENSIONS.has(filter.member)) {
      throw new Error(
        `Ungoverned filter member: ${filter.member}`
      );
    }
  }

  return true;
}

/**
 * Identify whether a question requires multi-step investigation.
 */
function requiresRootCauseAnalysis(question) {
  const normalized = question.toLowerCase();

  return [
    "why",
    "drop",
    "decrease",
    "decline",
    "increase",
    "change",
  ].some((keyword) => normalized.includes(keyword));
}

/**
 * Create the analytical plan for the MetricMind agent.
 */
function createAnalysisPlan(question) {
  const region = detectRegion(question);
  const normalized = question.toLowerCase();

  if (!requiresRootCauseAnalysis(question)) {
    const cubeQuery = buildCubeQuery(question);

    validateGovernedQuery(cubeQuery);

    return {
      type: "single_step",
      queries: [
        {
          step: 1,
          purpose: "Answer the business question",
          cubeQuery,
        },
      ],
    };
  }

  const primaryQuery = buildCubeQuery(
    `${question} margin trend quarterly`
  );

  validateGovernedQuery(primaryQuery);

  const secondaryQuery = {
    measures: [
      MEASURES.shippingcost,
      MEASURES.materialcost,
    ],
    dimensions: [DIMENSIONS.productcategory],
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

  validateGovernedQuery(secondaryQuery);

  const queries = [
    {
      step: 1,
      purpose: "Analyze the primary business metric trend",
      cubeQuery: primaryQuery,
    },
    {
      step: 2,
      purpose: "Investigate shipping and material cost drivers",
      cubeQuery: secondaryQuery,
    },
  ];

  if (
    normalized.includes("compare") ||
    normalized.includes("region") ||
    normalized.includes("regional")
  ) {
    const comparisonQuery = {
      measures: [
        MEASURES.revenue,
        MEASURES.profit,
        MEASURES.margin,
      ],
      dimensions: [DIMENSIONS.region],
      timeDimensions: [
        {
          dimension: DIMENSIONS.date,
          granularity: "quarter",
        },
      ],
      filters: [],
      limit: 1000,
    };

    validateGovernedQuery(comparisonQuery);

    queries.push({
      step: 3,
      purpose: "Compare regional business performance",
      cubeQuery: comparisonQuery,
    });
  }

  return {
    type: "root_cause_analysis",
    queries,
  };
}

/**
 * Main MetricMind agent entry point.
 */
async function runAgent(question) {
  if (!question || typeof question !== "string") {
    throw new Error(
      "A natural-language business question is required."
    );
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
  validateGovernedQuery,
};
// Governed agent configuration maintained for MetricMind analytical queries.

// Governed query validation keeps analytical requests within the approved semantic model.
