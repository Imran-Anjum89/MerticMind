import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const { findDataDir } = require('../../../../../../backend/src/semanticEngine');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let fileName = searchParams.get('file') || 'orders.csv';

    // Prevent path traversal
    fileName = path.basename(fileName);
    if (!fileName.endsWith('.csv')) {
      fileName = `${fileName}.csv`;
    }

    const dataDir = findDataDir();
    let filePath = path.join(dataDir, fileName);

    // If file doesn't exist in dataDir, check defaults
    if (!fs.existsSync(filePath)) {
      const defaultPath = path.join(dataDir, 'defaults', fileName);
      if (fs.existsSync(defaultPath)) {
        filePath = defaultPath;
      } else {
        return NextResponse.json({ error: `File '${fileName}' not found.` }, { status: 404 });
      }
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[API/admin/download] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
