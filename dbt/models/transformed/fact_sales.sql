select
    o.order_id,
    o.order_date,
    o.customer_id,
    o.product_id,
    o.quantity,
    o.revenue,
    coalesce(s.shipping_cost, 0) as shipping_cost,
    coalesce(m.material_cost, 0) as material_cost,
    coalesce(s.shipping_cost, 0) + coalesce(m.material_cost, 0) as cost,
    o.revenue
        - coalesce(s.shipping_cost, 0)
        - coalesce(m.material_cost, 0) as profit
from {{ ref('stg_orders') }} o
left join {{ ref('stg_shipping_costs') }} s
    on o.order_id = s.order_id
left join {{ ref('stg_material_costs') }} m
    on o.order_id = m.order_id