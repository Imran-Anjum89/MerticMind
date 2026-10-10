-- dim_products.sql (dbt transformed model)
-- Product dimension table with margin category classification

WITH source AS (
    SELECT * FROM {{ source('raw', 'raw_products') }}
)

SELECT
    product_id,
    product_name,
    category                                                   AS product_category,
    CAST(base_price AS FLOAT)                                  AS base_price,
    CAST(unit_cost AS FLOAT)                                   AS unit_cost,

    -- Pre-compute unit margin for product profitability ranking
    ROUND(
        (CAST(base_price AS FLOAT) - CAST(unit_cost AS FLOAT))
        / CAST(base_price AS FLOAT) * 100.0,
        2
    )                                                          AS unit_margin_pct,

    -- Classify products by margin tier
    CASE
        WHEN ((CAST(base_price AS FLOAT) - CAST(unit_cost AS FLOAT))
              / CAST(base_price AS FLOAT) * 100.0) >= 50 THEN 'High Margin'
        WHEN ((CAST(base_price AS FLOAT) - CAST(unit_cost AS FLOAT))
              / CAST(base_price AS FLOAT) * 100.0) >= 25 THEN 'Mid Margin'
        ELSE 'Low Margin'
    END                                                        AS margin_tier

FROM source
WHERE product_id IS NOT NULL
