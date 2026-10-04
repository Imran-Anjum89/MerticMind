import { NextResponse } from 'next/server';

const { initWarehouse, getWarehouseHealth } = require('../../../../../backend/src/semanticEngine');

export async function GET() {
  try {
    await initWarehouse(); // idempotent — safe to call multiple times
    const health = await getWarehouseHealth();

    return NextResponse.json({
      status:    health.status,
      timestamp: new Date().toISOString(),
      warehouse: {
        engine:         health.engine,
        tablesAndViews: health.tablesAndViews,
        factSalesRows:  health.factSalesRows,
        initialized:    health.initialized
      },
      dbt: {
        status: 'active',
        models: health.dbtModels || [],
        lastRun: new Date().toISOString()
      },
      cube: {
        status:     'governed',
        schema:     'Sales',
        governanceRules: [
          'Direct raw SQL generation is strictly prohibited.',
          'All AI requests are mapped to governed Cube.dev JSON API payloads.',
          'Row limit cap: Max 1000 rows per query.',
          'Consistent metric calculations enforced across all regions.'
        ]
      },
      langchain: {
        status:    'active',
        scenarios: ['ROOT_CAUSE', 'REGIONAL_OVERVIEW', 'COST_BREAKDOWN', 'SEGMENT_ANALYSIS', 'PRODUCT_ANALYSIS', 'COST_GOVERNANCE']
      }
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
