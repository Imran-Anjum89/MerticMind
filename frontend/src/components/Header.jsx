'use client';

import React from 'react';
import { Database, ShieldCheck, Cpu, Layers, BrainCircuit, GitBranch } from 'lucide-react';

export default function Header() {
  return (
    <header
      className="glass-panel"
      style={{
        padding:        '14px 24px',
        marginBottom:   '24px',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        flexWrap:       'wrap',
        gap:            '16px',
        borderBottom:   '1px solid rgba(99,102,241,0.18)'
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width:           '44px',
            height:          '44px',
            borderRadius:    '13px',
            background:      'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            boxShadow:       '0 4px 20px rgba(99, 102, 241, 0.45)',
            flexShrink:       0
          }}
        >
          <Cpu size={22} color="#ffffff" />
        </div>

        <div>
          <h1 style={{ fontSize: '19px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            MetricMind{' '}
            <span
              style={{
                fontSize:   '12px',
                fontWeight: '600',
                color:      'var(--accent-cyan)',
                background: 'rgba(6,182,212,0.10)',
                padding:    '2px 8px',
                borderRadius: '6px',
                marginLeft:   '4px',
                verticalAlign: 'middle'
              }}
            >
              Agentic BI
            </span>
          </h1>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Governed Semantic Layer · Multi-Step Reasoning Engine
          </p>
        </div>
      </div>

      {/* Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Live health dot */}
        <div
          className="badge badge-emerald"
          style={{ gap: '6px' }}
          title="Snowflake-compatible SQLite engine running"
        >
          <span className="health-dot" />
          <Database size={12} />
          Snowflake DW
        </div>

        <div className="badge badge-indigo" title="dbt fact_sales, dim_* models active">
          <GitBranch size={12} />
          dbt: fact_sales
        </div>

        <div className="badge badge-cyan" title="Cube.dev semantic schema governing all queries">
          <ShieldCheck size={12} />
          Cube.dev Governed
        </div>

        <div className="badge badge-violet" title="LangChain agent orchestrating multi-step reasoning">
          <BrainCircuit size={12} />
          LangChain Active
        </div>

        <div className="badge badge-amber" title="Semantic layer: measures & dimensions locked">
          <Layers size={12} />
          Semantic Layer
        </div>
      </div>
    </header>
  );
}
