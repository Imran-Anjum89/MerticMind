-- stg_orders.sql
-- Staging model for raw orders with clean date parsing and revenue pre-computation

WITH source AS (
    SELECT * FROM {{ source('raw', 'raw_orders') }}
),

cleaned AS (
    SELECT
        order_id,
        CAST(order_date AS DATE)                                              AS order_date,
        customer_id,
        product_id,
        region_id,
        CAST(quantity AS INTEGER)                                             AS quantity,
        CAST(unit_price AS FLOAT)                                             AS unit_price,
        CAST(discount_amount AS FLOAT)                                        AS discount_amount,

        -- Pre-compute gross revenue
        (CAST(quantity AS INTEGER) * CAST(unit_price AS FLOAT)
            - CAST(discount_amount AS FLOAT))                                 AS gross_revenue,

        -- Derive order quarter for time-series analysis
        DATE_TRUNC('quarter', CAST(order_date AS DATE))                       AS order_quarter,

        -- Derive order year
        DATE_PART('year', CAST(order_date AS DATE))                           AS order_year
    FROM source
    WHERE order_id IS NOT NULL
      AND order_date IS NOT NULL
      AND quantity > 0
)

SELECT * FROM cleaned
