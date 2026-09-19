select
    order_id,
    shipping_cost
from {{ ref('shipping_costs') }}