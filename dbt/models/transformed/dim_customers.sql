-- dim_customers.sql (dbt transformed model)
-- Customer dimension table for analytics

WITH stg AS (
    SELECT * FROM {{ ref('stg_customers') }}
),

regions AS (
    SELECT region_id, region_name FROM {{ source('raw', 'raw_regions') }}
)

SELECT
    stg.customer_id,
    stg.customer_name,
    stg.customer_segment,
    stg.country,
    stg.region_id,
    r.region_name                          AS region,
    stg.is_enterprise,

    -- Segment tier for BI reporting
    CASE
        WHEN stg.customer_segment = 'Enterprise' THEN 1
        WHEN stg.customer_segment = 'SMB'        THEN 2
        ELSE 3
    END                                    AS segment_tier

FROM stg
LEFT JOIN regions r ON stg.region_id = r.region_id
