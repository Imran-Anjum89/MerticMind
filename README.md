# MetricMind: Agentic Semantic BI Engine

**MetricMind** is a governed, conversational Business Intelligence engine designed according to strict enterprise Semantic Layer architecture. 

Instead of allowing an LLM to generate raw, unconstrained Text-to-SQL queries directly against warehouse tables (which risks hallucinated joins, broken business logic, and security vulnerabilities), **MetricMind forces the AI agent to translate natural language user questions into governed Cube.dev Semantic Layer JSON API calls**.

---

## 🏛️ System Architecture

```
                    USER
                      │
                      ▼
            Next.js Conversational UI
                      │
              Natural Language
                      │
                      ▼
                AI AGENT
            LangChain + LLM
                      │
          ❌ No direct SQL access
                      │
                      ▼
            SEMANTIC LAYER
               Cube.dev
                      │
            Governed API Query
                      │
                      ▼
           DATA WAREHOUSE
      Snowflake / Dual-Mode Engine
                      │
                      ▼
              JSON DATA
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    AI Explanation          Dynamic ECharts
```

---

## 🚀 Key Features & Non-Negotiable Requirements

- **Governed Semantic Layer**: Centralized measures (`Revenue`, `Cost`, `Profit`, `Margin`, `ShippingCost`, `MaterialCost`) and dimensions (`Region`, `Country`, `ProductCategory`, `Date`).
- **Zero Raw SQL Hallucination**: AI Agent translates natural language strictly into Cube.dev JSON query payloads.
- **dbt Transformation Pipeline**: Raw seed layers (`raw_orders`, `raw_shipping_costs`, `raw_material_costs`) → Staging views → Transformed `fact_sales` analytical model.
- **Dual-Mode Data Warehouse**: Supports cloud Snowflake connection (`SNOWFLAKE_ACCOUNT`) or local zero-config embedded warehouse engine for offline demo.
- **Multi-Step Analytical Reasoning**: Automatic root cause investigation for metric anomalies (e.g. why European margins dropped last quarter).
- **Dynamic Visualizations**: Apache ECharts integration rendering line-bar combo trends and regional breakdowns.
- **Governed API Transparency**: Includes "View Cube API Call" & "View Governed SQL" drawers for full compliance inspection.
- **Supported Regions**: `Europe`, `North America`, `India`, `Japan`.

---

## 📁 Repository Structure

```
MetricMind/
├── frontend/                     # Next.js Conversational BI App & API Routes
│   ├── src/
│   │   ├── app/                  # App Router & API Endpoints (/api/agent, /api/schema)
│   │   ├── components/           # AnalysisCard, ChartViewer, TransparencyModal, Header
│   │   └── globals.css           # Glassmorphism dark mode styling
├── backend/                      # Core Semantic Engine & LangChain Agent
│   ├── src/
│   │   ├── semanticEngine.js     # Governed Cube.dev Query Execution & Warehouse Layer
│   │   ├── agent.js              # Multi-Step Reasoning & Root Cause Investigator
│   │   └── testSemanticEngine.js # Backend verification suite
├── dbt/                          # dbt Transformation Models
│   ├── dbt_project.yml
│   └── models/
│       ├── staging/              # stg_orders, stg_shipping, stg_materials
│       └── transformed/          # fact_sales, dim_products, dim_regions
├── cube/                         # Cube.dev Schema Definitions
│   ├── cube.js
│   └── model/cubes/Sales.js      # Governed measures & dimensions
├── data/                         # Mock Corporate Datasets (CSV)
│   ├── orders.csv
│   ├── shipping_costs.csv
│   ├── material_costs.csv
│   ├── customers.csv
│   ├── products.csv
│   └── regions.csv
└── README.md
```

---

## ⚙️ Running MetricMind Locally

### 1. Run Backend Core Verification
```bash
cd backend
npm install
npm run test:semantic
```

### 2. Start Conversational BI Next.js Application
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔍 Sample Analysis Prompt

Click the preset card or type:
> **"Why did European margins drop last quarter?"**

### Expected Multi-Step Breakdown:
1. **Primary Query**: Fetches margin trend for Europe over quarters.
2. **Secondary Query**: Breaks down total cost into shipping fees (EuroFreight surcharges) vs material costs (hardware inflation).
3. **Attribution Synthesis**: Identifies +320% surge in shipping surcharges and +32.1% material price increases as the root causes.
