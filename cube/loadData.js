const duckdb = require("duckdb");

const db = new duckdb.Database("./metricmind.duckdb");

db.serialize(() => {
  db.run(`
    CREATE OR REPLACE TABLE orders AS
    SELECT * FROM read_csv_auto('../data/orders.csv', HEADER=TRUE)
  `);

  db.run(`
    CREATE OR REPLACE TABLE shipping_costs AS
    SELECT * FROM read_csv_auto('../data/shipping_costs.csv', HEADER=TRUE)
  `);

  db.run(`
    CREATE OR REPLACE TABLE material_costs AS
    SELECT * FROM read_csv_auto('../data/material_costs.csv', HEADER=TRUE)
  `);

  db.run(`
    CREATE OR REPLACE TABLE customers AS
    SELECT * FROM read_csv_auto('../data/customers.csv', HEADER=TRUE)
  `);

  db.run(`
    CREATE OR REPLACE TABLE products AS
    SELECT * FROM read_csv_auto('../data/products.csv', HEADER=TRUE)
  `);

  db.run(`
    CREATE OR REPLACE TABLE regions AS
    SELECT * FROM read_csv_auto('../data/regions.csv', HEADER=TRUE)
  `);

  console.log("MetricMind DuckDB database created.");
});

db.close();
