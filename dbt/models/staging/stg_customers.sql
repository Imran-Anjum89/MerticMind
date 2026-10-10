-- stg_customers.sql
-- Staging model: clean customers with segment classification and country standardization

WITH source AS (
    SELECT * FROM {{ source('raw', 'raw_customers') }}
),

cleaned AS (
    SELECT
        customer_id,
        TRIM(customer_name)                                                    AS customer_name,

        -- Standardize customer segment names
        CASE
            WHEN LOWER(segment) IN ('enterprise', 'large enterprise') THEN 'Enterprise'
            WHEN LOWER(segment) IN ('smb', 'small business', 'mid-market') THEN 'SMB'
            WHEN LOWER(segment) IN ('consumer', 'b2c', 'individual') THEN 'Consumer'
            ELSE COALESCE(segment, 'Unknown')
        END                                                                    AS customer_segment,

        region_id,

        -- Standardize country names
        TRIM(UPPER(country))                                                   AS country,

        -- Derived boolean flags
        CASE WHEN LOWER(segment) IN ('enterprise', 'large enterprise')
             THEN TRUE ELSE FALSE
        END                                                                    AS is_enterprise
    FROM source
    WHERE customer_id IS NOT NULL
)

SELECT * FROM cleaned
