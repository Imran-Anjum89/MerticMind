import { NextResponse } from 'next/server';

const { initWarehouse, processUserQuestion } = require('../../../lib/engine');

let warehouseInitialized = false;

export async function POST(request) {
  try {
    // Idempotent warehouse init
    if (!warehouseInitialized) {
      await initWarehouse();
      warehouseInitialized = true;
      console.log('[API/agent] Warehouse initialized on first request');
    }

    const body     = await request.json();
    const question = body.question?.trim() || 'Why did European margins drop last quarter?';

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log(`[API/agent] Processing: "${question}"`);
    const result = await processUserQuestion(question);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[API/agent] Error:', error.message);
    return NextResponse.json(
      {
        error:      error.message || 'Error processing agent request',
        scenario:   'ERROR',
        explanation: {
          summary:     `Agent encountered an error: ${error.message}`,
          keyFindings: ['Check that the warehouse is properly initialized.'],
          rootCauses:  []
        },
        chartConfig: null,
        transparency: null
      },
      { status: error.message.includes('GOVERNANCE') ? 403 : 500 }
    );
  }
}
