const duckdb = require("duckdb");

const db = new duckdb.Database("./metricmind.duckdb");

const sql = `
CREATE OR REPLACE TABLE fact_sales AS
SELECT
    o.order_id,
    o.date AS order_date,
    o.customer_id,
    o.product_id,
    o.quantity,
    o.revenue,
    c.country,
    c.region,
    p.product_category,
    COALESCE(s.shipping_cost, 0) AS shipping_cost,
    COALESCE(m.material_cost, 0) AS material_cost,
    COALESCE(s.shipping_cost, 0) + COALESCE(m.material_cost, 0) AS cost,
    o.revenue
        - COALESCE(s.shipping_cost, 0)
        - COALESCE(m.material_cost, 0) AS profit
FROM orders o
LEFT JOIN shipping_costs s
    ON o.order_id = s.order_id
LEFT JOIN material_costs m
    ON o.order_id = m.order_id
LEFT JOIN customers c
    ON o.customer_id = c.customer_id
LEFT JOIN products p
    ON o.product_id = p.product_id
`;

db.run(sql, (err) => {
    if (err) {
        console.error(err);
        db.close();
        process.exit(1);
    }

    db.all(
        "SELECT COUNT(*) AS row_count FROM fact_sales",
        (err, rows) => {
            if (err) {
                console.error(err);
                db.close();
                process.exit(1);
            }

            console.log(rows);
            db.close();
        }
    );
});
