select
    region_id,
    region,
    country
from {{ ref('regions') }}