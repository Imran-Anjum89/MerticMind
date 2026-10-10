-- fact_sales.sql (dbt transformed model)
-- Primary analytical fact table joining all staged entities
-- Mirrors the SQLite view in semanticEngine.js for dual-mode compatibility

WITH orders AS (
    SELECT * FROM {{ ref('stg_orders') }}
),

customers AS (
    SELECT * FROM {{ ref('stg_customers') }}
),

products AS (
    SELECT * FROM {{ source('raw', 'raw_products') }}
),

regions AS (
    SELECT * FROM {{ source('raw', 'raw_regions') }}
),

shipping AS (
    SELECT * FROM {{ ref('stg_shipping_costs') }}
),

materials AS (
    SELECT * FROM {{ ref('stg_material_costs') }}
),

joined AS (
    SELECT
        -- Order identifiers
        o.order_id,
        o.order_date,
        o.order_quarter,
        o.order_year,

        -- Customer dimensions
        o.customer_id,
        c.customer_name,
        c.customer_segment,
        c.country,
        c.is_enterprise,

        -- Product dimensions
        o.product_id,
        p.product_name,
        p.category                                                             AS product_category,
        p.base_price,
        p.unit_cost                                                            AS product_unit_cost,

        -- Region dimension
        o.region_id,
        r.region_name                                                          AS region,
        r.currency,

        -- Order metrics
        o.quantity,
        o.unit_price,
        o.discount_amount,

        -- Revenue calculation
        o.gross_revenue                                                        AS revenue,

        -- Shipping cost (from enriched staging, fallback to quantity × $15)
        COALESCE(
            s.total_shipping_cost,
            o.quantity * 15.0
        )                                                                      AS shipping_cost,

        -- Material cost (from enriched staging, fallback to quantity × unit_cost)
        COALESCE(
            m.total_material_cost,
            o.quantity * p.unit_cost
        )                                                                      AS material_cost,

        -- Derived total cost
        (
            COALESCE(s.total_shipping_cost, o.quantity * 15.0)
            + COALESCE(m.total_material_cost, o.quantity * p.unit_cost)
        )                                                                      AS total_cost,

        -- Derived profit
        (
            o.gross_revenue
            - COALESCE(s.total_shipping_cost, o.quantity * 15.0)
            - COALESCE(m.total_material_cost, o.quantity * p.unit_cost)
        )                                                                      AS profit,

        -- Margin percentage
        CASE
            WHEN o.gross_revenue > 0
            THEN ROUND(
                (
                    o.gross_revenue
                    - COALESCE(s.total_shipping_cost, o.quantity * 15.0)
                    - COALESCE(m.total_material_cost, o.quantity * p.unit_cost)
                ) / o.gross_revenue * 100.0,
                2
            )
            ELSE 0.0
        END                                                                    AS margin_pct,

        -- Shipping enrichment flags
        COALESCE(s.is_high_cost_shipping, FALSE)                               AS is_high_cost_shipping,
        COALESCE(s.carrier_type, 'Standard Carrier')                          AS carrier_type,

        -- Material enrichment flags
        COALESCE(m.is_high_tariff, FALSE)                                      AS is_high_tariff,
        COALESCE(m.tariff_ratio_pct, 0.0)                                      AS tariff_ratio_pct

    FROM orders o
    LEFT JOIN customers c      ON o.customer_id = c.customer_id
    LEFT JOIN products p       ON o.product_id  = p.product_id
    LEFT JOIN regions r        ON o.region_id   = r.region_id
    LEFT JOIN shipping s       ON o.order_id    = s.order_id
    LEFT JOIN materials m      ON o.product_id  = m.product_id
                               AND o.region_id  = m.region_id
)

SELECT * FROM joined
