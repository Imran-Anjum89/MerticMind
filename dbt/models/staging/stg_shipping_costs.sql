-- stg_shipping_costs.sql
-- Staging model for raw shipping costs with total cost enrichment

WITH source AS (
    SELECT * FROM {{ source('raw', 'raw_shipping_costs') }}
),

cleaned AS (
    SELECT
        shipping_id,
        order_id,
        region_id,
        quarter,
        shipping_carrier,
        CAST(shipping_fee AS FLOAT)                                            AS shipping_fee,
        CAST(fuel_surcharge AS FLOAT)                                          AS fuel_surcharge,

        -- Pre-compute total shipping cost per order
        (CAST(shipping_fee AS FLOAT) + CAST(fuel_surcharge AS FLOAT))         AS total_shipping_cost,

        -- Flag high-cost shipping events (EuroFreight surcharge threshold)
        CASE
            WHEN (CAST(shipping_fee AS FLOAT) + CAST(fuel_surcharge AS FLOAT)) > 500
            THEN TRUE
            ELSE FALSE
        END                                                                    AS is_high_cost_shipping,

        -- Carrier type classification
        CASE
            WHEN shipping_carrier LIKE '%Euro%' THEN 'European Carrier'
            WHEN shipping_carrier LIKE '%Pacific%' THEN 'Asia Pacific Carrier'
            WHEN shipping_carrier LIKE '%Express%' THEN 'Express Carrier'
            ELSE 'Standard Carrier'
        END                                                                    AS carrier_type
    FROM source
    WHERE shipping_id IS NOT NULL
      AND order_id IS NOT NULL
)

SELECT * FROM cleaned
