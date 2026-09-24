'use client';

import React from 'react';
import { HelpCircle, ArrowRight, TrendingDown, Globe, DollarSign, Users, Package, ShieldCheck } from 'lucide-react';

const PRESETS = [
  {
    icon:    TrendingDown,
    label:   'Root Cause Investigation',
    badge:   'badge-rose',
    query:   'Why did European margins drop last quarter?',
    desc:    'Multi-step breakdown: EuroFreight surcharges & material cost inflation',
    color:   'var(--accent-rose)'
  },
  {
    icon:    Globe,
    label:   'Regional Performance',
    badge:   'badge-cyan',
    query:   'Compare revenue and gross margins across Europe, North America, India, Japan',
    desc:    'Governed metrics benchmark across all 4 operational regions',
    color:   'var(--accent-cyan)'
  },
  {
    icon:    DollarSign,
    label:   'Cost Structure Analysis',
    badge:   'badge-amber',
    query:   'What is the shipping cost vs material cost breakdown in Europe?',
    desc:    'Component-level variance attribution: carrier fees vs hardware inflation',
    color:   'var(--accent-amber)'
  },
  {
    icon:    Users,
    label:   'Segment Analysis',
    badge:   'badge-violet',
    query:   'Show me enterprise vs SMB revenue comparison across all regions',
    desc:    'Customer segment performance: Enterprise, SMB, Consumer breakdown',
    color:   'var(--accent-violet)'
  },
  {
    icon:    Package,
    label:   'Product Category Deep-Dive',
    badge:   'badge-indigo',
    query:   'Show me product category breakdown in Europe',
    desc:    'Hardware vs Software vs Services revenue distribution and margin analysis',
    color:   'var(--accent-primary)'
  },
  {
    icon:    ShieldCheck,
    label:   'Cost Governance Audit',
    badge:   'badge-emerald',
    query:   'Show me the cost governance report for all regions',
    desc:    'AI governance audit: verified Cube.dev JSON payloads, row limits, compliance check',
    color:   'var(--accent-emerald)'
  }
];

export default function PresetPrompts({ onSelectPrompt, disabled }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <HelpCircle size={14} color="var(--accent-cyan)" />
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Quick Analysis Presets
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '4px' }}>— click to execute governed query</span>
      </div>

      <div style={{
        display:               'grid',
        gridTemplateColumns:   'repeat(auto-fill, minmax(270px, 1fr))',
        gap:                   '10px'
      }}>
        {PRESETS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              id={`preset-${idx}`}
              onClick={() => onSelectPrompt(p.query)}
              disabled={disabled}
              className="glass-panel"
              style={{
                padding:    '14px 16px',
                textAlign:  'left',
                cursor:     disabled ? 'not-allowed' : 'pointer',
                opacity:    disabled ? 0.55 : 1,
                display:    'flex',
                flexDirection: 'column',
                gap:        '8px',
                background: 'rgba(14, 22, 40, 0.65)',
                border:     '1px solid rgba(255, 255, 255, 0.07)',
                transition: 'all 0.22s ease'
              }}
              onMouseEnter={e => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = p.color + '55';
                  e.currentTarget.style.background   = 'rgba(24, 36, 66, 0.85)';
                  e.currentTarget.style.transform    = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                e.currentTarget.style.background   = 'rgba(14, 22, 40, 0.65)';
                e.currentTarget.style.transform    = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width:      '28px', height: '28px', borderRadius: '8px',
                  background: `${p.color}18`,
                  border:     `1px solid ${p.color}30`,
                  display:    'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={14} color={p.color} />
                </div>
                <span className={`badge ${p.badge}`} style={{ fontSize: '10.5px' }}>{p.label}</span>
              </div>

              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', lineHeight: 1.35 }}>
                {p.query}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.4, flex: 1 }}>
                  {p.desc}
                </p>
                <ArrowRight size={13} color={p.color} style={{ flexShrink: 0, marginLeft: '8px' }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
