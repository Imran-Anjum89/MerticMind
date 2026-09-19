select
    order_id,
    date as order_date,
    customer_id,
    product_id,
    quantity,
    revenue
from {{ ref('orders') }}