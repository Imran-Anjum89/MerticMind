-- dim_regions.sql (dbt transformed model)
-- Region dimension with currency and timezone metadata

WITH source AS (
    SELECT * FROM {{ source('raw', 'raw_regions') }}
)

SELECT
    region_id,
    region_name                                    AS region,
    currency,

    -- Map region to continent for aggregated reporting
    CASE region_name
        WHEN 'Europe'        THEN 'EMEA'
        WHEN 'North America' THEN 'Americas'
        WHEN 'India'         THEN 'APAC'
        WHEN 'Japan'         THEN 'APAC'
        ELSE 'Other'
    END                                            AS continent_group,

    -- Reporting currency indicator
    CASE currency
        WHEN 'EUR' THEN TRUE
        ELSE FALSE
    END                                            AS is_euro_region

FROM source
WHERE region_id IS NOT NULL
