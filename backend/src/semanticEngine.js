const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Initialize in-memory Snowflake-compatible database engine (Dual-Mode: works offline)
const db = new sqlite3.Database(':memory:');

// ─────────────────────────────────────────────────────────────────────────────
// Database helpers
// ─────────────────────────────────────────────────────────────────────────────

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function querySql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Parse CSV file safely
function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx];
    });
    return rowObj;
  });
  return { headers, rows };
}

// ─────────────────────────────────────────────────────────────────────────────
// Warehouse initialization: Seed mock data & run dbt-equivalent transformations
// ─────────────────────────────────────────────────────────────────────────────

let _warehouseReady = false;

function findDataDir() {
  const candidates = [
    process.env.METRICMIND_DATA_DIR,
    path.join(__dirname, '../../data'),
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), '../data'),
    path.join(process.cwd(), '../../data'),
    path.join(__dirname, '../../../data'),
    path.join(__dirname, '../../../../data'),
  ].filter(Boolean);

  if (process.env.INIT_CWD) {
    candidates.unshift(path.join(process.env.INIT_CWD, '../data'));
    candidates.unshift(path.join(process.env.INIT_CWD, 'data'));
  }

  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, 'regions.csv'))) {
        return dir;
      }
    } catch (_) { /* skip */ }
  }
  throw new Error(`Cannot locate data directory with regions.csv. Tried: ${candidates.join(', ')}`);
}

async function initWarehouse(forceReload = false) {
  if (_warehouseReady && !forceReload) return;

  if (forceReload) {
    try {
      await runSql('DROP VIEW IF EXISTS fact_sales');
      await runSql('DROP VIEW IF EXISTS dim_customers');
      await runSql('DROP VIEW IF EXISTS dim_products');
      await runSql('DROP VIEW IF EXISTS dim_regions');
      await runSql('DROP VIEW IF EXISTS stg_material_costs');
      await runSql('DROP VIEW IF EXISTS stg_shipping_costs');
      await runSql('DROP VIEW IF EXISTS stg_customers');
      await runSql('DROP TABLE IF EXISTS raw_material_costs');
      await runSql('DROP TABLE IF EXISTS raw_shipping_costs');
      await runSql('DROP TABLE IF EXISTS raw_orders');
      await runSql('DROP TABLE IF EXISTS raw_customers');
      await runSql('DROP TABLE IF EXISTS raw_products');
      await runSql('DROP TABLE IF EXISTS raw_regions');
    } catch (_) {}
  }

  const dataDir = findDataDir();

  // 1. Raw Regions (regions.csv: region_id, region, country)
  await runSql(`CREATE TABLE IF NOT EXISTS raw_regions (region_id TEXT, region_name TEXT, country TEXT, currency TEXT)`);
  const regData = parseCsv(path.join(dataDir, 'regions.csv'));
  const countryToRegion = {};
  for (const r of regData.rows) {
    const regionName = r.region || r.region_name;
    const currency = r.currency || (regionName === 'Europe' ? 'EUR' : regionName === 'India' ? 'INR' : regionName === 'Japan' ? 'JPY' : 'USD');
    countryToRegion[r.country] = { region_id: r.region_id, region_name: regionName, currency };
    await runSql(`INSERT INTO raw_regions VALUES (?, ?, ?, ?)`, [r.region_id, regionName, r.country, currency]);
  }

  // 2. Raw Products (products.csv: product_id, product_name, product_category)
  await runSql(`CREATE TABLE IF NOT EXISTS raw_products (product_id TEXT, product_name TEXT, category TEXT, base_price REAL, unit_cost REAL)`);
  const prodData = parseCsv(path.join(dataDir, 'products.csv'));
  for (const p of prodData.rows) {
    const category = p.product_category || p.category || 'General';
    const basePrice = parseFloat(p.base_price) || 500.0;
    const unitCost = parseFloat(p.unit_cost) || 300.0;
    await runSql(`INSERT INTO raw_products VALUES (?, ?, ?, ?, ?)`, [p.product_id, p.product_name, category, basePrice, unitCost]);
  }

  // 3. Raw Customers (customers.csv: customer_id, customer_name, country, region)
  await runSql(`CREATE TABLE IF NOT EXISTS raw_customers (customer_id TEXT, customer_name TEXT, segment TEXT, region_id TEXT, country TEXT)`);
  const custData = parseCsv(path.join(dataDir, 'customers.csv'));
  const custMap = {};
  for (const c of custData.rows) {
    const num = parseInt((c.customer_id || '').replace(/\D/g, ''), 10) || 0;
    const segment = c.segment || (num % 3 === 0 ? 'Enterprise' : num % 3 === 1 ? 'SMB' : 'Consumer');
    const regInfo = countryToRegion[c.country] || { region_id: 'R001', region_name: c.region || 'Europe' };
    custMap[c.customer_id] = { region_id: regInfo.region_id, region_name: regInfo.region_name, segment, country: c.country };
    await runSql(`INSERT INTO raw_customers VALUES (?, ?, ?, ?, ?)`, [c.customer_id, c.customer_name, segment, regInfo.region_id, c.country]);
  }

  // 4. Raw Orders (orders.csv: order_id, date, customer_id, product_id, quantity, revenue)
  await runSql(`CREATE TABLE IF NOT EXISTS raw_orders (order_id TEXT, order_date TEXT, customer_id TEXT, product_id TEXT, region_id TEXT, quantity INTEGER, unit_price REAL, discount_amount REAL, revenue REAL)`);
  const ordData = parseCsv(path.join(dataDir, 'orders.csv'));
  const ordMap = {};
  for (const o of ordData.rows) {
    const cInfo = custMap[o.customer_id] || { region_id: 'R001', region_name: 'Europe' };
    const date = o.date || o.order_date;
    const qty = parseInt(o.quantity) || 1;
    const rev = parseFloat(o.revenue) || 0;
    const unitPrice = qty > 0 ? rev / qty : 0;
    ordMap[o.order_id] = { customer_id: o.customer_id, region_name: cInfo.region_name };
    await runSql(`INSERT INTO raw_orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [o.order_id, date, o.customer_id, o.product_id, cInfo.region_id, qty, unitPrice, 0.0, rev]);
  }

  // 5. Raw Shipping Costs (shipping_costs.csv: order_id, shipping_cost)
  await runSql(`CREATE TABLE IF NOT EXISTS raw_shipping_costs (shipping_id TEXT, order_id TEXT, region_id TEXT, quarter TEXT, shipping_carrier TEXT, shipping_fee REAL, fuel_surcharge REAL)`);
  const shipData = parseCsv(path.join(dataDir, 'shipping_costs.csv'));
  for (const s of shipData.rows) {
    const cost = parseFloat(s.shipping_cost) || 0;
    const oInfo = ordMap[s.order_id];
    const carrier = oInfo?.region_name === 'Europe' ? 'EuroFreight Logistics'
      : oInfo?.region_name === 'North America' ? 'Express Air Cargo'
      : 'Pacific Cargo Express';
    await runSql(`INSERT INTO raw_shipping_costs VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      s.shipping_id || `SHP-${s.order_id}`,
      s.order_id,
      null,
      null,
      carrier,
      cost * 0.75,
      cost * 0.25
    ]);
  }

  // 6. Raw Material Costs (material_costs.csv: order_id, material_cost)
  await runSql(`CREATE TABLE IF NOT EXISTS raw_material_costs (material_id TEXT, order_id TEXT, product_id TEXT, region_id TEXT, quarter TEXT, material_fee REAL, tariff_surcharge REAL)`);
  const matData = parseCsv(path.join(dataDir, 'material_costs.csv'));
  for (const m of matData.rows) {
    const cost = parseFloat(m.material_cost) || 0;
    await runSql(`INSERT INTO raw_material_costs VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      m.material_id || `MAT-${m.order_id}`,
      m.order_id,
      null,
      null,
      null,
      cost * 0.80,
      cost * 0.20
    ]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // dbt-equivalent transformation views
  // ─────────────────────────────────────────────────────────────────────────

  // Staging: stg_customers (segment normalization)
  await runSql(`
    CREATE VIEW stg_customers AS
    SELECT
      customer_id,
      TRIM(customer_name) AS customer_name,
      CASE
        WHEN LOWER(segment) IN ('enterprise', 'large enterprise') THEN 'Enterprise'
        WHEN LOWER(segment) IN ('smb', 'small business', 'mid-market') THEN 'SMB'
        WHEN LOWER(segment) IN ('consumer', 'b2c', 'individual') THEN 'Consumer'
        ELSE COALESCE(segment, 'Unknown')
      END AS customer_segment,
      region_id,
      UPPER(TRIM(country)) AS country,
      CASE WHEN LOWER(segment) IN ('enterprise', 'large enterprise') THEN 1 ELSE 0 END AS is_enterprise
    FROM raw_customers
    WHERE customer_id IS NOT NULL
  `);

  // Staging: stg_shipping_costs (enriched totals)
  await runSql(`
    CREATE VIEW stg_shipping_costs AS
    SELECT
      shipping_id, order_id, region_id, quarter, shipping_carrier,
      shipping_fee, fuel_surcharge,
      (shipping_fee + fuel_surcharge) AS total_shipping_cost,
      CASE WHEN (shipping_fee + fuel_surcharge) > 500 THEN 1 ELSE 0 END AS is_high_cost_shipping,
      CASE
        WHEN shipping_carrier LIKE '%Euro%'    THEN 'European Carrier'
        WHEN shipping_carrier LIKE '%Pacific%' THEN 'Asia Pacific Carrier'
        WHEN shipping_carrier LIKE '%Express%' THEN 'Express Carrier'
        ELSE 'Standard Carrier'
      END AS carrier_type
    FROM raw_shipping_costs
    WHERE order_id IS NOT NULL
  `);

  // Staging: stg_material_costs (enriched totals + tariff ratio)
  await runSql(`
    CREATE VIEW stg_material_costs AS
    SELECT
      material_id, order_id, product_id, region_id, quarter,
      material_fee, tariff_surcharge,
      (material_fee + tariff_surcharge) AS total_material_cost,
      CASE WHEN material_fee > 0
        THEN ROUND(tariff_surcharge / material_fee * 100.0, 2) ELSE 0.0
      END AS tariff_ratio_pct,
      CASE WHEN tariff_surcharge > 200 THEN 1 ELSE 0 END AS is_high_tariff
    FROM raw_material_costs
    WHERE order_id IS NOT NULL
  `);

  // Transformed: dim_regions
  await runSql(`
    CREATE VIEW dim_regions AS
    SELECT
      region_id, region_name AS region, country, currency,
      CASE region_name
        WHEN 'Europe'        THEN 'EMEA'
        WHEN 'North America' THEN 'Americas'
        WHEN 'India'         THEN 'APAC'
        WHEN 'Japan'         THEN 'APAC'
        ELSE 'Other'
      END AS continent_group,
      CASE WHEN currency = 'EUR' THEN 1 ELSE 0 END AS is_euro_region
    FROM raw_regions WHERE region_id IS NOT NULL
  `);

  // Transformed: dim_products
  await runSql(`
    CREATE VIEW dim_products AS
    SELECT
      product_id, product_name, category AS product_category,
      base_price, unit_cost,
      ROUND((base_price - unit_cost) / base_price * 100.0, 2) AS unit_margin_pct,
      CASE
        WHEN ((base_price - unit_cost) / base_price * 100.0) >= 50 THEN 'High Margin'
        WHEN ((base_price - unit_cost) / base_price * 100.0) >= 25 THEN 'Mid Margin'
        ELSE 'Low Margin'
      END AS margin_tier
    FROM raw_products WHERE product_id IS NOT NULL
  `);

  // Transformed: dim_customers (with region join)
  await runSql(`
    CREATE VIEW dim_customers AS
    SELECT
      c.customer_id, c.customer_name, c.customer_segment, c.country,
      c.region_id, r.region, c.is_enterprise,
      CASE c.customer_segment
        WHEN 'Enterprise' THEN 1
        WHEN 'SMB'        THEN 2
        ELSE 3
      END AS segment_tier
    FROM stg_customers c
    LEFT JOIN (SELECT DISTINCT region_id, region FROM dim_regions) r ON c.region_id = r.region_id
  `);

  // Transformed: fact_sales (primary analytical model — mirrors dbt model)
  await runSql(`
    CREATE VIEW fact_sales AS
    SELECT
      o.order_id,
      o.order_date,
      strftime('%Y-Q', o.order_date) || CAST(((CAST(strftime('%m', o.order_date) AS INTEGER) - 1) / 3 + 1) AS TEXT) AS order_quarter,
      CAST(strftime('%Y', o.order_date) AS INTEGER) AS order_year,
      o.customer_id,
      c.customer_name,
      c.customer_segment,
      c.country,
      c.is_enterprise,
      o.product_id,
      p.product_name,
      p.product_category,
      p.base_price,
      p.unit_cost AS product_unit_cost,
      c.region_id,
      c.region,
      r.currency,
      r.continent_group,
      o.quantity,
      o.unit_price,
      o.discount_amount,
      o.revenue,
      COALESCE(s.total_shipping_cost, o.quantity * 15.0)                    AS shipping_cost,
      COALESCE(m.total_material_cost, o.quantity * p.unit_cost)             AS material_cost,
      (COALESCE(s.total_shipping_cost, o.quantity * 15.0)
       + COALESCE(m.total_material_cost, o.quantity * p.unit_cost))         AS total_cost,
      (o.revenue
       - COALESCE(s.total_shipping_cost, o.quantity * 15.0)
       - COALESCE(m.total_material_cost, o.quantity * p.unit_cost))         AS profit,
      CASE
        WHEN o.revenue > 0 THEN
          ROUND(
            (o.revenue
             - COALESCE(s.total_shipping_cost, o.quantity * 15.0)
             - COALESCE(m.total_material_cost, o.quantity * p.unit_cost))
            / o.revenue * 100.0,
            2
          )
        ELSE 0.0
      END AS margin_pct,
      COALESCE(s.is_high_cost_shipping, 0)         AS is_high_cost_shipping,
      COALESCE(s.carrier_type, 'Standard Carrier')  AS carrier_type,
      COALESCE(m.is_high_tariff, 0)                AS is_high_tariff,
      COALESCE(m.tariff_ratio_pct, 0.0)            AS tariff_ratio_pct
    FROM raw_orders o
    JOIN dim_products p             ON o.product_id  = p.product_id
    JOIN dim_customers c            ON o.customer_id = c.customer_id
    LEFT JOIN (SELECT DISTINCT region_id, currency, continent_group FROM dim_regions) r ON c.region_id = r.region_id
    LEFT JOIN stg_shipping_costs s  ON o.order_id    = s.order_id
    LEFT JOIN stg_material_costs m  ON o.order_id    = m.order_id
  `);

  _warehouseReady = true;
  console.log('[MetricMind] ✅ Warehouse initialized — dbt views materialized in SQLite');
}

// ─────────────────────────────────────────────────────────────────────────────
// Governed Cube.dev Schema Dictionary
// ─────────────────────────────────────────────────────────────────────────────

const MEASURE_MAP = {
  'Sales.revenue':      { expr: 'SUM(revenue)',                                                                    alias: 'revenue',      title: 'Total Revenue',       format: '$' },
  'Sales.cost':         { expr: 'SUM(total_cost)',                                                                 alias: 'cost',         title: 'Total Cost',          format: '$' },
  'Sales.shippingCost': { expr: 'SUM(shipping_cost)',                                                              alias: 'shippingCost', title: 'Shipping Cost',        format: '$' },
  'Sales.materialCost': { expr: 'SUM(material_cost)',                                                              alias: 'materialCost', title: 'Material Cost',        format: '$' },
  'Sales.profit':       { expr: 'SUM(profit)',                                                                     alias: 'profit',       title: 'Net Profit',           format: '$' },
  'Sales.margin':       { expr: 'CASE WHEN SUM(revenue) > 0 THEN ROUND((SUM(profit) / SUM(revenue)) * 100.0, 2) ELSE 0 END', alias: 'margin', title: 'Margin %', format: '%' },
  'Sales.count':        { expr: 'COUNT(order_id)',                                                                 alias: 'count',        title: 'Order Count',          format: '#' },
  'Sales.quantity':     { expr: 'SUM(quantity)',                                                                   alias: 'quantity',     title: 'Total Quantity',       format: '#' },
};

const DIMENSION_MAP = {
  'Sales.region':          { expr: 'region',           alias: 'region',          title: 'Region' },
  'Sales.country':         { expr: 'country',          alias: 'country',         title: 'Country' },
  'Sales.productCategory': { expr: 'product_category', alias: 'productCategory', title: 'Product Category' },
  'Sales.productName':     { expr: 'product_name',     alias: 'productName',     title: 'Product Name' },
  'Sales.customerSegment': { expr: 'customer_segment', alias: 'customerSegment', title: 'Customer Segment' },
  'Sales.continentGroup':  { expr: 'continent_group',  alias: 'continentGroup',  title: 'Continent Group' },
  'Sales.carrierType':     { expr: 'carrier_type',     alias: 'carrierType',     title: 'Carrier Type' },
  'Sales.date':            { expr: 'order_date',       alias: 'date',            title: 'Order Date' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Governed Query Execution Engine
// Accepts ONLY Cube.dev JSON payloads — direct SQL is rejected
// ─────────────────────────────────────────────────────────────────────────────

async function executeCubeQuery(cubeQuery) {
  // GOVERNANCE RULE 1: Reject raw SQL input
  if (typeof cubeQuery === 'string' || cubeQuery.sql) {
    throw new Error('GOVERNANCE ERROR: Direct SQL execution is blocked. MetricMind requires governed Cube.dev JSON API queries.');
  }

  const measures       = cubeQuery.measures       || [];
  const dimensions     = cubeQuery.dimensions     || [];
  const timeDimensions = cubeQuery.timeDimensions || [];
  const filters        = cubeQuery.filters        || [];

  // GOVERNANCE RULE 2: Row limit cap
  const limit = Math.min(cubeQuery.limit || 500, 1000);

  const selectFields  = [];
  const groupByFields = [];

  // Resolve dimensions
  dimensions.forEach(dimKey => {
    const dimDef = DIMENSION_MAP[dimKey];
    if (!dimDef) throw new Error(`GOVERNANCE ERROR: Dimension '${dimKey}' not defined in governed Cube schema.`);
    selectFields.push(`${dimDef.expr} AS "${dimDef.alias}"`);
    groupByFields.push(dimDef.expr);
  });

  // Resolve time dimensions
  timeDimensions.forEach(td => {
    const dimDef = DIMENSION_MAP[td.dimension];
    if (!dimDef) throw new Error(`GOVERNANCE ERROR: Time dimension '${td.dimension}' not defined in governed Cube schema.`);

    if (td.granularity === 'quarter') {
      const expr = `strftime('%Y-Q', order_date) || CAST(((CAST(strftime('%m', order_date) AS INTEGER) - 1) / 3 + 1) AS TEXT)`;
      selectFields.push(`${expr} AS "quarter"`);
      groupByFields.push(expr);
    } else if (td.granularity === 'month') {
      const expr = `strftime('%Y-%m', order_date)`;
      selectFields.push(`${expr} AS "month"`);
      groupByFields.push(expr);
    } else if (td.granularity === 'year') {
      const expr = `strftime('%Y', order_date)`;
      selectFields.push(`${expr} AS "year"`);
      groupByFields.push(expr);
    } else {
      selectFields.push(`${dimDef.expr} AS "${dimDef.alias}"`);
      groupByFields.push(dimDef.expr);
    }
  });

  // Resolve measures
  measures.forEach(mKey => {
    const mDef = MEASURE_MAP[mKey];
    if (!mDef) throw new Error(`GOVERNANCE ERROR: Measure '${mKey}' not defined in governed Cube schema.`);
    selectFields.push(`${mDef.expr} AS "${mDef.alias}"`);
  });

  if (selectFields.length === 0) {
    throw new Error('GOVERNANCE ERROR: Query must specify at least one measure or dimension.');
  }

  // Build governed WHERE clause
  const whereClauses = [];
  const params       = [];

  filters.forEach(f => {
    const dimDef = DIMENSION_MAP[f.member];
    if (!dimDef) return;

    if (f.operator === 'equals' && Array.isArray(f.values) && f.values.length > 0) {
      const placeholders = f.values.map(() => '?').join(', ');
      whereClauses.push(`${dimDef.expr} IN (${placeholders})`);
      params.push(...f.values);
    } else if (f.operator === 'notEquals' && Array.isArray(f.values) && f.values.length > 0) {
      const placeholders = f.values.map(() => '?').join(', ');
      whereClauses.push(`${dimDef.expr} NOT IN (${placeholders})`);
      params.push(...f.values);
    }
  });

  // Assemble governed SQL
  let sql = `SELECT ${selectFields.join(', ')} FROM fact_sales`;
  if (whereClauses.length > 0) sql += ` WHERE ${whereClauses.join(' AND ')}`;
  if (groupByFields.length > 0) sql += ` GROUP BY ${groupByFields.join(', ')}`;
  if (dimensions.length > 0 || timeDimensions.length > 0) sql += ` ORDER BY 1 ASC`;
  sql += ` LIMIT ${limit}`;

  const data = await querySql(sql, params);

  // Estimate query cost (GOVERNANCE RULE 3: Cost transparency)
  const costEstimate = {
    rowsReturned:   data.length,
    rowLimit:       limit,
    dimensionCount: dimensions.length + timeDimensions.length,
    measureCount:   measures.length,
    filterCount:    filters.length,
    complexityRating: dimensions.length + measures.length > 4 ? 'Medium' : 'Low'
  };

  return {
    data,
    executedSql: sql,
    cubeQuery,
    costEstimate
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Health check for /api/health route
// ─────────────────────────────────────────────────────────────────────────────

async function getWarehouseHealth() {
  try {
    const tableCount = await querySql(
      `SELECT COUNT(*) as cnt FROM sqlite_master WHERE type IN ('table', 'view')`
    );
    const orderCount = await querySql(`SELECT COUNT(*) as cnt FROM fact_sales`);
    return {
      status: 'healthy',
      engine: 'SQLite (Dual-Mode: Snowflake-compatible)',
      tablesAndViews: tableCount[0].cnt,
      factSalesRows: orderCount[0].cnt,
      dbtModels: ['stg_customers', 'stg_shipping_costs', 'stg_material_costs', 'dim_regions', 'dim_products', 'dim_customers', 'fact_sales'],
      initialized: _warehouseReady
    };
  } catch (err) {
    return { status: 'unhealthy', error: err.message, initialized: false };
  }
}

async function getWarehouseStats() {
  await initWarehouse();
  try {
    const summary = await querySql(`
      SELECT
        COUNT(*) as totalOrders,
        ROUND(COALESCE(SUM(revenue), 0), 2) as totalRevenue,
        ROUND(COALESCE(SUM(total_cost), 0), 2) as totalCost,
        ROUND(COALESCE(SUM(profit), 0), 2) as totalProfit,
        ROUND(COALESCE(AVG(margin_pct), 0), 2) as avgMargin,
        COALESCE(MIN(order_date), 'N/A') as minDate,
        COALESCE(MAX(order_date), 'N/A') as maxDate
      FROM fact_sales
    `);

    const regions = await querySql(`
      SELECT region, COUNT(*) as orders, ROUND(SUM(revenue), 2) as revenue
      FROM fact_sales GROUP BY region ORDER BY revenue DESC
    `);

    const categories = await querySql(`
      SELECT product_category, COUNT(*) as orders, ROUND(SUM(revenue), 2) as revenue
      FROM fact_sales GROUP BY product_category ORDER BY revenue DESC
    `);

    return {
      summary: summary[0] || {},
      regions,
      categories
    };
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = {
  initWarehouse,
  executeCubeQuery,
  getWarehouseHealth,
  getWarehouseStats,
  findDataDir,
  MEASURE_MAP,
  DIMENSION_MAP
};

