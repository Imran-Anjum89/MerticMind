import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const {
  initWarehouse,
  getWarehouseHealth,
  getWarehouseStats,
  findDataDir
} = require('../../../../lib/engine');

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    let targetFileName = formData.get('targetFileName') || (file ? file.name : null);

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided in form data.' }, { status: 400 });
    }

    if (!targetFileName.endsWith('.csv')) {
      targetFileName = `${targetFileName}.csv`;
    }

    // Sanitize target file name to prevent path traversal
    targetFileName = path.basename(targetFileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString('utf8');

    // Basic CSV validation
    const lines = content.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) {
      return NextResponse.json({ success: false, error: 'The uploaded file is empty.' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    if (headers.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'The uploaded file must be a comma-separated CSV with at least 2 columns.'
      }, { status: 400 });
    }

    const dataDir = findDataDir();
    const destPath = path.join(dataDir, targetFileName);

    // Write file to data directory
    fs.writeFileSync(destPath, buffer);
    console.log(`[API/admin/upload] Saved ${buffer.length} bytes to ${destPath}`);

    // Re-initialize and re-materialize the warehouse immediately with the new dataset
    await initWarehouse(true);

    const health = await getWarehouseHealth();
    const stats = await getWarehouseStats();

    return NextResponse.json({
      success: true,
      message: `File '${targetFileName}' uploaded successfully (${lines.length - 1} data rows). Warehouse re-materialized with updated metrics.`,
      uploadedFile: {
        fileName: targetFileName,
        rows: lines.length - 1,
        headers,
        sizeBytes: buffer.length
      },
      health,
      stats
    });
  } catch (error) {
    console.error('[API/admin/upload] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
