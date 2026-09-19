select
    customer_id,
    customer_name,
    country,
    region
from {{ ref('customers') }}