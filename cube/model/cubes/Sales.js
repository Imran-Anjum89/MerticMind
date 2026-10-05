cube(`Sales`, {
  sql: `SELECT * FROM fact_sales`,

  joins: {},

  measures: {
    count: {
      type:        `count`,
      sql:         `order_id`,
      title:       `Order Count`,
      description: `Total number of orders`
    },

    revenue: {
      type:        `sum`,
      sql:         `revenue`,
      title:       `Total Revenue`,
      description: `Gross Revenue = (Quantity × Unit Price) − Discount Amount`,
      format:      `currency`
    },

    cost: {
      type:        `sum`,
      sql:         `total_cost`,
      title:       `Total Cost`,
      description: `Total cost = Shipping Cost + Material Cost`,
      format:      `currency`
    },

    shippingCost: {
      type:        `sum`,
      sql:         `shipping_cost`,
      title:       `Shipping Cost`,
      description: `Total carrier fee + fuel surcharge per order`,
      format:      `currency`
    },

    materialCost: {
      type:        `sum`,
      sql:         `material_cost`,
      title:       `Material Cost`,
      description: `Total raw material procurement + tariff surcharge per product`,
      format:      `currency`
    },

    profit: {
      type:        `sum`,
      sql:         `profit`,
      title:       `Net Profit`,
      description: `Revenue − Total Cost`,
      format:      `currency`
    },

    margin: {
      type:        `number`,
      sql:         `CASE WHEN ${revenue} > 0 THEN ROUND((${profit} / ${revenue}) * 100.0, 2) ELSE 0 END`,
      title:       `Gross Margin %`,
      description: `Profitability margin: (Profit / Revenue) × 100. Defined centrally — AI cannot override.`,
      format:      `percent`
    },

    quantity: {
      type:        `sum`,
      sql:         `quantity`,
      title:       `Total Quantity Sold`,
      description: `Sum of all units sold across orders`,
      format:      `number`
    }
  },

  dimensions: {
    orderId: {
      sql:        `order_id`,
      type:       `string`,
      primaryKey: true,
      title:      `Order ID`
    },

    region: {
      sql:   `region`,
      type:  `string`,
      title: `Region`,
      description: `Supported: Europe, North America, India, Japan`
    },

    country: {
      sql:   `country`,
      type:  `string`,
      title: `Country`
    },

    continentGroup: {
      sql:   `continent_group`,
      type:  `string`,
      title: `Continent Group`,
      description: `Aggregated region grouping: EMEA, Americas, APAC`
    },

    productCategory: {
      sql:   `product_category`,
      type:  `string`,
      title: `Product Category`,
      description: `Hardware, Software, or Services`
    },

    productName: {
      sql:   `product_name`,
      type:  `string`,
      title: `Product Name`
    },

    customerSegment: {
      sql:   `customer_segment`,
      type:  `string`,
      title: `Customer Segment`,
      description: `Enterprise, SMB, or Consumer — normalized in dbt staging layer`
    },

    carrierType: {
      sql:   `carrier_type`,
      type:  `string`,
      title: `Carrier Type`,
      description: `European Carrier, Asia Pacific Carrier, Express Carrier, Standard Carrier`
    },

    date: {
      sql:   `order_date`,
      type:  `time`,
      title: `Order Date`,
      description: `Supports Day, Month, Quarter, Year granularities`
    }
  },

  preAggregations: {}
});
