/**
 * MetricMind - Semantic Engine
 *
 * Provides the governed semantic-layer foundation
 * used by the MetricMind analytical agent.
 *
 * Raw SQL is not generated here.
 */

const SEMANTIC_LAYER = "Cube.dev";

const SALES_CUBE = "Sales";
// Governed business measures
const MEASURES = Object.freeze({
  revenue: "Sales.revenue",
  cost: "Sales.cost",
  profit: "Sales.profit",
  margin: "Sales.margin",
  shippingCost: "Sales.shippingCost",
  materialCost: "Sales.materialCost",
});

// Governed business dimensions
const DIMENSIONS = Object.freeze({
  region: "Sales.region",
  country: "Sales.country",
  productCategory: "Sales.productCategory",
  date: "Sales.date",
});

/**
 * Governed semantic-layer configuration.
 */
const semanticModel = {
  semanticLayer: SEMANTIC_LAYER,
  cube: SALES_CUBE,
};

function getSemanticModel() {
  return semanticModel;
}

function isSupportedCube(cubeName) {
  return cubeName === SALES_CUBE;
}

function validateCubeQuery(query) {
  if (!query || typeof query !== "object") {
    throw new Error("Cube query must be a valid object.");
  }

  if (!Array.isArray(query.measures)) {
    throw new Error("Cube query must contain measures.");
  }

  if (!Array.isArray(query.dimensions)) {
    throw new Error("Cube query must contain dimensions.");
  }

  if (!Array.isArray(query.timeDimensions)) {
    throw new Error("Cube query must contain timeDimensions.");
  }

  if (!Array.isArray(query.filters)) {
    throw new Error("Cube query must contain filters.");
  }

  return true;
}

function createSemanticRequest(query) {
  validateCubeQuery(query);

  return {
    semanticLayer: SEMANTIC_LAYER,
    cube: SALES_CUBE,
    query,
  };
}

module.exports = {
  SEMANTIC_LAYER,
  SALES_CUBE,
  MEASURES,
  DIMENSIONS,
  getSemanticModel,
  isSupportedCube,
  validateCubeQuery,
  createSemanticRequest,
};