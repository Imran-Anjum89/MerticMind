'use client';

import React from 'react';
import { Database, ShieldCheck, Cpu, Layers, BrainCircuit, GitBranch } from 'lucide-react';

export default function Header({ onOpenAdmin, onOpenCompliance }) {
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

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {onOpenCompliance && (
          <button
            onClick={() => onOpenCompliance('checklist')}
            className="btn-icon"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              gap: '6px',
              borderColor: 'rgba(16,185,129,0.3)',
              color: 'var(--accent-emerald)',
              background: 'rgba(16,185,129,0.06)'
            }}
            title="View 20 Governance & Compliance Standards"
          >
            <ShieldCheck size={13} />
            20 Governance Standards
          </button>
        )}

        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="btn-primary"
            style={{
              padding: '7px 15px',
              fontSize: '12px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              boxShadow: '0 2px 14px rgba(99,102,241,0.4)',
              cursor: 'pointer'
            }}
            title="Open Admin Panel to upload and manage datasets"
          >
            <Database size={13} />
            Admin Panel (Upload Data)
          </button>
        )}
      </div>
    </header>
  );
}
