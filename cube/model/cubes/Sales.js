/**
 * MetricMind - Sales Cube
 *
 * Governed measures and dimensions for business analytics.
 */

cube("Sales", {
  sql_table: "fact_sales",

  measures: {
    revenue: {
      type: "sum",
      sql: "revenue",
    },

    cost: {
      type: "sum",
      sql: "cost",
    },

    profit: {
      type: "sum",
      sql: "profit",
    },

    margin: {
      type: "number",
      sql: "CASE WHEN ${revenue} = 0 THEN 0 ELSE ${profit} / ${revenue} END",
      format: "percent",
    },

    shippingCost: {
      type: "sum",
      sql: "shipping_cost",
    },

    materialCost: {
      type: "sum",
      sql: "material_cost",
    },
  },

  dimensions: {
    region: {
      sql: "region",
      type: "string",
    },

    country: {
      sql: "country",
      type: "string",
    },

    productCategory: {
      sql: "product_category",
      type: "string",
    },

    date: {
      sql: "order_date",
      type: "time",
    },
  },
});