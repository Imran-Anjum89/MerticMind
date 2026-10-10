-- stg_material_costs.sql
-- Staging model for raw material costs with total cost enrichment and inflation tagging

WITH source AS (
    SELECT * FROM {{ source('raw', 'raw_material_costs') }}
),

cleaned AS (
    SELECT
        material_id,
        product_id,
        region_id,
        quarter,
        CAST(material_fee AS FLOAT)                                            AS material_fee,
        CAST(tariff_surcharge AS FLOAT)                                        AS tariff_surcharge,

        -- Pre-compute total material cost
        (CAST(material_fee AS FLOAT) + CAST(tariff_surcharge AS FLOAT))       AS total_material_cost,

        -- Tariff contribution ratio (useful for inflation attribution)
        CASE
            WHEN CAST(material_fee AS FLOAT) > 0
            THEN ROUND(CAST(tariff_surcharge AS FLOAT) / CAST(material_fee AS FLOAT) * 100.0, 2)
            ELSE 0.0
        END                                                                    AS tariff_ratio_pct,

        -- Flag high-tariff events (hardware inflation indicator)
        CASE
            WHEN CAST(tariff_surcharge AS FLOAT) > 200 THEN TRUE
            ELSE FALSE
        END                                                                    AS is_high_tariff
    FROM source
    WHERE material_id IS NOT NULL
      AND product_id IS NOT NULL
)

SELECT * FROM cleaned
