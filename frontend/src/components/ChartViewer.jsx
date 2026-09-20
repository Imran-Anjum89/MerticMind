'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { BarChart3 } from 'lucide-react';

// Shared ECharts theme tokens

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

// Chart option builders

function buildLineBarCombo(data) {
  const cats = data.map(d => d.quarter || d.month || d.region || '—');
  return {
    backgroundColor: 'transparent',
    tooltip: { ...THEME.tooltip, trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { ...THEME.legend, data: ['Revenue ($)', 'Total Cost ($)', 'Margin (%)'], top: 4 },
    grid: THEME.grid,
    xAxis: [{ type: 'category', data: cats, axisLine: THEME.axisLine, axisLabel: THEME.axisLabel }],
    yAxis: [
      { type: 'value', name: '$', axisLine: THEME.axisLine, axisLabel: THEME.axisLabel, splitLine: THEME.splitLine },
      { type: 'value', name: '%', min: 0, max: 100, axisLine: { lineStyle: { color: '#6366f1' } }, axisLabel: { color: '#818cf8', fontSize: 11, formatter: '{value}%' }, splitLine: { show: false } }
    ],
    series: [
      {
        name: 'Revenue ($)', type: 'bar', barWidth: '26%',
        data: data.map(d => +(d.revenue || 0).toFixed(0)),
        itemStyle: { color: linearColor([{ offset: 0, color: COLORS.cyan[0] }, { offset: 1, color: COLORS.cyan[1] }]), borderRadius: [6, 6, 0, 0] }
      },
      {
        name: 'Total Cost ($)', type: 'bar', barWidth: '26%',
        data: data.map(d => +(d.cost || 0).toFixed(0)),
        itemStyle: { color: linearColor([{ offset: 0, color: COLORS.rose[0] }, { offset: 1, color: COLORS.rose[1] }]), borderRadius: [6, 6, 0, 0] }
      },
      {
        name: 'Margin (%)', type: 'line', yAxisIndex: 1, smooth: true,
        data: data.map(d => +(d.margin || 0).toFixed(2)),
        lineStyle: { width: 3, color: COLORS.indigo[0] },
        itemStyle: { color: COLORS.indigo[0] },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99,102,241,0.25)' }, { offset: 1, color: 'rgba(99,102,241,0.00)' }] } }
      }
    ]
  };
}

function buildBarRegion(data) {
  const cats = data.map(d => d.region || d.customerSegment || d.productCategory || '—');
  return {
    backgroundColor: 'transparent',
    tooltip: { ...THEME.tooltip, trigger: 'axis' },
    legend: { ...THEME.legend, data: ['Revenue ($)', 'Profit ($)', 'Margin (%)'], top: 4 },
    grid: THEME.grid,
    xAxis: { type: 'category', data: cats, axisLine: THEME.axisLine, axisLabel: { ...THEME.axisLabel, rotate: cats.length > 4 ? 15 : 0 } },
    yAxis: [
      { type: 'value', name: '$', axisLine: THEME.axisLine, axisLabel: THEME.axisLabel, splitLine: THEME.splitLine },
      { type: 'value', name: '%', min: 0, max: 100, axisLine: { lineStyle: { color: '#6366f1' } }, axisLabel: { color: '#818cf8', fontSize: 11, formatter: '{value}%' }, splitLine: { show: false } }
    ],
    series: [
      {
        name: 'Revenue ($)', type: 'bar', barGap: '10%',
        data: data.map(d => +(d.revenue || 0).toFixed(0)),
        itemStyle: { color: linearColor([{ offset: 0, color: COLORS.indigo[0] }, { offset: 1, color: COLORS.indigo[1] }]), borderRadius: [5, 5, 0, 0] }
      },
      {
        name: 'Profit ($)', type: 'bar',
        data: data.map(d => +(d.profit || 0).toFixed(0)),
        itemStyle: { color: linearColor([{ offset: 0, color: COLORS.emerald[0] }, { offset: 1, color: COLORS.emerald[1] }]), borderRadius: [5, 5, 0, 0] }
      },
      {
        name: 'Margin (%)', type: 'line', yAxisIndex: 1, smooth: true,
        data: data.map(d => +(d.margin || 0).toFixed(2)),
        lineStyle: { width: 2.5, color: COLORS.amber[0] },
        itemStyle: { color: COLORS.amber[0] }
      }
    ]
  };
}

function buildStackedBar(data) {
  const cats = data.map(d => d.quarter || d.month || d.region || '—');
  return {
    backgroundColor: 'transparent',
    tooltip: { ...THEME.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { ...THEME.legend, data: ['Shipping Cost ($)', 'Material Cost ($)'], top: 4 },
    grid: THEME.grid,
    xAxis: { type: 'category', data: cats, axisLine: THEME.axisLine, axisLabel: THEME.axisLabel },
    yAxis: { type: 'value', name: '$', axisLine: THEME.axisLine, axisLabel: THEME.axisLabel, splitLine: THEME.splitLine },
    series: [
      {
        name: 'Shipping Cost ($)', type: 'bar', stack: 'costs',
        data: data.map(d => +(d.shippingCost || 0).toFixed(0)),
        itemStyle: { color: linearColor([{ offset: 0, color: COLORS.cyan[0] }, { offset: 1, color: COLORS.cyan[1] }]), borderRadius: [0, 0, 0, 0] }
      },
      {
        name: 'Material Cost ($)', type: 'bar', stack: 'costs',
        data: data.map(d => +(d.materialCost || 0).toFixed(0)),
        itemStyle: { color: linearColor([{ offset: 0, color: COLORS.amber[0] }, { offset: 1, color: COLORS.amber[1] }]), borderRadius: [5, 5, 0, 0] }
      }
    ]
  };
}

function buildPie(data) {
  const pieData = data.map(d => ({
    name:  d.productCategory || d.region || d.customerSegment || '—',
    value: +((d.revenue || 0)).toFixed(0)
  }));
  const palette = [COLORS.indigo[0], COLORS.cyan[0], COLORS.emerald[0], COLORS.amber[0], COLORS.violet[0], COLORS.rose[0]];

  return {
    backgroundColor: 'transparent',
    tooltip: {
      ...THEME.tooltip,
      trigger: 'item',
      formatter: (p) => `${p.name}<br/>Revenue: $${p.value.toLocaleString()}<br/>Share: ${p.percent}%`
    },
    legend: { ...THEME.legend, orient: 'vertical', right: '5%', top: 'center' },
    series: [{
      name:      'Revenue',
      type:      'pie',
      radius:    ['38%', '70%'],
      center:    ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#060a14', borderWidth: 3 },
      label:     { show: true, formatter: '{b}\n{d}%', color: '#94a3b8', fontSize: 11 },
      emphasis:  { label: { fontSize: 13, fontWeight: 700 }, itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.5)' } },
      data:      pieData.map((d, i) => ({ ...d, itemStyle: { color: palette[i % palette.length] } }))
    }]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ChartViewer Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ChartViewer({ chartConfig }) {
  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) return null;

  const data = chartConfig.data;
  const type = chartConfig.type || 'bar';

  let option;
  if (type === 'line_bar_combo') option = buildLineBarCombo(data);
  else if (type === 'stacked_bar')  option = buildStackedBar(data);
  else if (type === 'pie')          option = buildPie(data);
  else                              option = buildBarRegion(data);

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <BarChart3 size={18} color="var(--accent-cyan)" />
        <h3 style={{ fontSize: '15px', fontWeight: '700' }}>
          {chartConfig.title || 'Dynamic Metric Visualization'}
        </h3>
        <span className="badge badge-cyan" style={{ marginLeft: 'auto', fontSize: '10px' }}>
          ECharts · Live Data
        </span>
      </div>
      <ReactECharts
        option={option}
        style={{ height: type === 'pie' ? '320px' : '340px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}

