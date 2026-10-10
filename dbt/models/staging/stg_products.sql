WITH raw_prod AS (
    SELECT * FROM raw_products
)
SELECT
    product_id,
    product_name,
    category AS product_category,
    CAST(base_price AS DECIMAL(10,2)) AS base_price,
    CAST(unit_cost AS DECIMAL(10,2)) AS unit_cost
FROM raw_prod
