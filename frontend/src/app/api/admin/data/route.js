import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const {
  initWarehouse,
  getWarehouseHealth,
  getWarehouseStats,
  findDataDir
} = require('../../../../lib/engine');

const DESCRIPTIONS = {
  'orders.csv': 'Core transactional facts (Order ID, Date, Customer, Product, Quantity, Revenue)',
  'products.csv': 'Product catalog (Product ID, Name, Product Category)',
  'customers.csv': 'Customer master data (Customer ID, Name, Country, Region)',
  'shipping_costs.csv': 'Freight & logistics costs per order (Order ID, Shipping Cost)',
  'material_costs.csv': 'Procurement & raw materials costs per order (Order ID, Material Cost)',
  'regions.csv': 'Operating geographic territories & countries (Region ID, Region, Country)'
};

function inspectCsvFile(filePath, fileName) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split(/\r?\n/).filter(Boolean);
    const headers = lines.length > 0 ? lines[0].split(',').map(h => h.trim()) : [];
    const rowCount = Math.max(0, lines.length - 1);
    const preview = lines.slice(1, 4).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
      return obj;
    });

    return {
      fileName,
      description: DESCRIPTIONS[fileName] || 'Custom Business Dataset',
      sizeBytes: stat.size,
      sizeFormatted: stat.size > 1024 ? `${(stat.size / 1024).toFixed(1)} KB` : `${stat.size} B`,
      rowCount,
      headers,
      preview,
      lastModified: stat.mtime.toISOString()
    };
  } catch (err) {
    return { fileName, error: err.message };
  }
}

export async function GET() {
  try {
    await initWarehouse();
    const dataDir = findDataDir();
    const targetFiles = [
      'orders.csv',
      'products.csv',
      'customers.csv',
      'shipping_costs.csv',
      'material_costs.csv',
      'regions.csv'
    ];

    const files = targetFiles.map(name => inspectCsvFile(path.join(dataDir, name), name)).filter(Boolean);
    const health = await getWarehouseHealth();
    const stats = await getWarehouseStats();

    return NextResponse.json({
      success: true,
      dataDir,
      files,
      health,
      stats
    });
  } catch (error) {
    console.error('[API/admin/data] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const dataDir = findDataDir();

    if (action === 'reload') {
      await initWarehouse(true);
      const health = await getWarehouseHealth();
      const stats = await getWarehouseStats();
      return NextResponse.json({
        success: true,
        message: 'Warehouse successfully reloaded and re-materialized with current datasets.',
        health,
        stats
      });
    }

    if (action === 'reset') {
      const defaultsDir = path.join(dataDir, 'defaults');
      if (fs.existsSync(defaultsDir)) {
        const defaultFiles = fs.readdirSync(defaultsDir).filter(f => f.endsWith('.csv'));
        for (const file of defaultFiles) {
          fs.copyFileSync(path.join(defaultsDir, file), path.join(dataDir, file));
        }
      }
      await initWarehouse(true);
      const health = await getWarehouseHealth();
      const stats = await getWarehouseStats();
      return NextResponse.json({
        success: true,
        message: 'Datasets reset to default sample data and warehouse re-materialized.',
        health,
        stats
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action specified' }, { status: 400 });
  } catch (error) {
    console.error('[API/admin/data POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
