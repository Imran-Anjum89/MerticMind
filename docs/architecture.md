# MetricMind Architecture & Governance Specifications

## 1. Core Architecture Principles

MetricMind enforces strict architectural decoupling between the AI Agent and the Data Warehouse via a **Governed Semantic Layer (Cube.dev)**.

### Why Direct Text-to-SQL is Blocked:
1. **Join Hallucination**: Unconstrained LLMs frequently join raw dimension tables incorrectly.
2. **Inconsistent Metric Definitions**: Different SQL queries might compute "Margin" as `(Revenue - Cost)/Revenue` vs `Profit/GrossSales`, yielding conflicting executive reporting.
3. **Unbounded Expensive Queries**: Text-to-SQL can issue `SELECT *` without limit, locking warehouse resources.

---

## 2. Governed Query Flow

```
[User Question: "Why did European margins drop last quarter?"]
                        │
                        ▼
[LangChain Agent (Semantic Schema Parser)]
                        │
    (Validates measures & dimensions against Sales.js)
                        │
                        ▼
[Cube.dev API JSON Payload]
{
  "measures": ["Sales.margin", "Sales.revenue", "Sales.cost"],
  "dimensions": ["Sales.region"],
  "filters": [{ "member": "Sales.region", "operator": "equals", "values": ["Europe"] }],
  "timeDimensions": [{ "dimension": "Sales.date", "granularity": "quarter" }]
}
                        │
                        ▼
[Governed SQL Generation]
SELECT region, quarter, SUM(revenue), SUM(total_cost), margin_calc
FROM fact_sales
WHERE region = 'Europe'
GROUP BY 1, 2
LIMIT 1000
                        │
                        ▼
[Snowflake / Local Fact Table Execution]
                        │
                        ▼
[Governed JSON Results -> ECharts + AI Attribution Synthesis]
```

---

## 3. Metric & Dimension Definitions

### Measures (`cube/model/cubes/Sales.js`)
- `Revenue`: `SUM(revenue)`
- `Total Cost`: `SUM(total_cost)`
- `Shipping Cost`: `SUM(shipping_cost)`
- `Material Cost`: `SUM(material_cost)`
- `Profit`: `SUM(profit)`
- `Margin`: `(SUM(profit) / SUM(revenue)) * 100`

### Dimensions
- `Region`: `Europe`, `North America`, `India`, `Japan`
- `Country`: Customer country
- `Product Category`: `Hardware`, `Software`, `Services`
- `Order Date`: Time dimension supporting Day, Month, Quarter, Year granularities
