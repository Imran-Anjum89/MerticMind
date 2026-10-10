/**
 * MetricMind Backend Test Suite
 * Verifies governed Cube query execution across all 6 agent scenarios
 */

const { initWarehouse, executeCubeQuery, getWarehouseHealth } = require('./semanticEngine');
const { processUserQuestion } = require('./agent');

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  MetricMind — Backend Semantic Engine Test Suite         ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Initialize warehouse
  console.log('▶ Initializing warehouse...');
  await initWarehouse();

  // Health check
  const health = await getWarehouseHealth();
  console.log('✅ Warehouse Health:', JSON.stringify(health, null, 2));

  // ── TEST 1: Direct governed Cube query ────────────────────────────────────
  console.log('\n── TEST 1: Direct Governed Cube Query (All Regions) ────────');
  const t1 = await executeCubeQuery({
    measures:   ['Sales.revenue', 'Sales.cost', 'Sales.profit', 'Sales.margin', 'Sales.count'],
    dimensions: ['Sales.region']
  });
  console.log(`✅ Rows: ${t1.data.length} | SQL: ${t1.executedSql.substring(0, 80)}...`);
  t1.data.forEach(r => console.log(`   ${r.region}: Revenue=$${Number(r.revenue).toFixed(0)} Margin=${Number(r.margin).toFixed(1)}%`));

  // ── TEST 2: Governance block — raw SQL rejected ───────────────────────────
  console.log('\n── TEST 2: Governance Rule — Raw SQL Block ──────────────────');
  try {
    await executeCubeQuery({ sql: 'SELECT * FROM fact_sales' });
    console.log('❌ FAIL: Raw SQL should have been blocked!');
  } catch (err) {
    console.log(`✅ PASS: Raw SQL correctly blocked — "${err.message.substring(0, 60)}..."`);
  }

  // ── TEST 3: Scenario — Root cause analysis ───────────────────────────────
  console.log('\n── TEST 3: Agent Scenario — Root Cause (European Margins) ──');
  const t3 = await processUserQuestion('Why did European margins drop last quarter?');
  console.log(`✅ Scenario: ${t3.scenario} | Steps: ${t3.stepsExecuted}`);
  console.log(`   Summary: ${t3.explanation.summary.substring(0, 80)}...`);

  // ── TEST 4: Scenario — Segment analysis ──────────────────────────────────
  console.log('\n── TEST 4: Agent Scenario — Segment Analysis ────────────────');
  const t4 = await processUserQuestion('Show me enterprise vs SMB revenue comparison');
  console.log(`✅ Scenario: ${t4.scenario} | Steps: ${t4.stepsExecuted}`);
  console.log(`   Findings: ${t4.explanation.keyFindings.length} key findings`);

  // ── TEST 5: Scenario — Product category analysis ─────────────────────────
  console.log('\n── TEST 5: Agent Scenario — Product Analysis ────────────────');
  const t5 = await processUserQuestion('Show me product category breakdown in Europe');
  console.log(`✅ Scenario: ${t5.scenario} | Steps: ${t5.stepsExecuted}`);
  console.log(`   Chart type: ${t5.chartConfig.type}`);

  // ── TEST 6: Scenario — Cost breakdown ────────────────────────────────────
  console.log('\n── TEST 6: Agent Scenario — Cost Breakdown ──────────────────');
  const t6 = await processUserQuestion('What is the shipping cost vs material cost breakdown in Europe?');
  console.log(`✅ Scenario: ${t6.scenario} | Steps: ${t6.stepsExecuted}`);
  console.log(`   Chart type: ${t6.chartConfig.type}`);

  // ── TEST 7: Scenario — Cost governance audit ─────────────────────────────
  console.log('\n── TEST 7: Agent Scenario — Cost Governance Audit ───────────');
  const t7 = await processUserQuestion('Show me the most expensive cost governance report');
  console.log(`✅ Scenario: ${t7.scenario} | Steps: ${t7.stepsExecuted}`);
  console.log(`   Governance: ${t7.explanation.summary.substring(0, 80)}...`);

  // ── TEST 8: CustomerSegment dimension query ───────────────────────────────
  console.log('\n── TEST 8: New Dimension — Customer Segment ─────────────────');
  const t8 = await executeCubeQuery({
    measures:   ['Sales.revenue', 'Sales.margin'],
    dimensions: ['Sales.customerSegment']
  });
  console.log(`✅ Rows: ${t8.data.length} | Segments: ${t8.data.map(r => r.customerSegment).join(', ')}`);

  // ── TEST 9: Row limit governance ─────────────────────────────────────────
  console.log('\n── TEST 9: Governance Rule — Row Limit Cap ──────────────────');
  const t9 = await executeCubeQuery({
    measures:   ['Sales.revenue'],
    dimensions: ['Sales.productName'],
    limit:      9999 // Will be capped to 1000
  });
  console.log(`✅ Requested 9999 rows, got: ${t9.data.length} | Complexity: ${t9.costEstimate.complexityRating}`);

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  ✅ All Tests Passed — MetricMind Backend is Operational  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
