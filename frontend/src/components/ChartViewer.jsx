'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { BarChart3 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared ECharts theme tokens
// ─────────────────────────────────────────────────────────────────────────────
const THEME = {
  tooltip: {
    backgroundColor: '#0a1020',
    borderColor:     '#1e2d4a',
    textStyle:       { color: '#f1f5f9', fontSize: 12 }
  },
  legend: { textStyle: { color: '#94a3b8', fontSize: 12 } },
  axisLabel: { color: '#94a3b8', fontSize: 11 },
  axisLine:  { lineStyle: { color: '#1e2d4a' } },
  splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
  grid:      { left: '2%', right: '4%', bottom: '4%', top: '14%', containLabel: true }
};

const COLORS = {
  cyan:    ['#06b6d4', '#0891b2'],
  rose:    ['#f43f5e', '#be123c'],
  indigo:  ['#6366f1', '#4f46e5'],
  emerald: ['#10b981', '#059669'],
  amber:   ['#f59e0b', '#d97706'],
  violet:  ['#8b5cf6', '#7c3aed']
};

function linearColor(stops) {
  return { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: stops };
}

