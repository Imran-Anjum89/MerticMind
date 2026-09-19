select
    order_id,
    material_cost
from {{ ref('material_costs') }}