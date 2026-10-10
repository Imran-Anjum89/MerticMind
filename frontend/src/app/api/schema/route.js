import { NextResponse } from 'next/server';

const { MEASURE_MAP, DIMENSION_MAP } = require('../../../lib/engine');

export async function GET() {
  return NextResponse.json({
    cube:       'Sales',
    version:    '2.0',
    description: 'Governed Cube.dev semantic schema. All AI queries are validated against this schema — unauthorized dimensions/measures are rejected.',
    measures: Object.keys(MEASURE_MAP).map(key => ({
      name:   key,
      sql:    MEASURE_MAP[key].expr,
      alias:  MEASURE_MAP[key].alias,
      title:  MEASURE_MAP[key].title,
      format: MEASURE_MAP[key].format
    })),
    dimensions: Object.keys(DIMENSION_MAP).map(key => ({
      name:  key,
      sql:   DIMENSION_MAP[key].expr,
      alias: DIMENSION_MAP[key].alias,
      title: DIMENSION_MAP[key].title
    })),
    governanceRules: [
      'Direct raw SQL generation is strictly prohibited by the governance engine.',
      'All AI requests are mapped to governed Cube.dev JSON API payloads only.',
      'Row limit cap: Maximum 1,000 rows per query — prevents warehouse resource exhaustion.',
      'Consistent metric calculations enforced across all regions (no ad-hoc metric redefinition).',
      'Unauthorized dimensions or measures return GOVERNANCE ERROR — not silent failures.',
      'Query cost estimation is returned with every response for audit transparency.'
    ],
    supportedRegions:   ['Europe', 'North America', 'India', 'Japan'],
    supportedSegments:  ['Enterprise', 'SMB', 'Consumer'],
    supportedCategories: ['Hardware', 'Software', 'Services']
  });
}
