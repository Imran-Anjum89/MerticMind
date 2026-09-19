select
    product_id,
    product_name,
    product_category
from {{ ref('products') }}