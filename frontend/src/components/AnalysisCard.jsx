'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, TrendingDown, ShieldCheck, Zap } from 'lucide-react';

// Impact color map
const IMPACT_BADGE = {
  'High':        'badge-rose',
  'Medium-High': 'badge-amber',
  'Medium':      'badge-amber',
  'Low':         'badge-indigo',
  'Compliance':  'badge-emerald',
  'Governance':  'badge-cyan',
  'Performance': 'badge-violet'
};

export default function AnalysisCard({ explanation, scenario }) {
  if (!explanation) return null;

  const isGovernance = scenario === 'COST_GOVERNANCE';

  return (
    <div
      className="glass-panel"
      style={{
        padding:    '20px 22px',
        borderLeft: `3px solid ${isGovernance ? 'var(--accent-emerald)' : 'var(--accent-primary)'}`
      }}
    >
      {/* Summary */}
      <div style={{
        background:   'rgba(0,0,0,0.22)',
        padding:      '13px 16px',
        borderRadius: '10px',
        marginBottom: '18px',
        borderLeft:   '2px solid rgba(99,102,241,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
          {isGovernance
            ? <ShieldCheck size={14} color="var(--accent-emerald)" />
            : <Zap         size={14} color="var(--accent-cyan)" />
          }
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {isGovernance ? 'Governance Report' : 'AI Executive Summary'}
          </span>
        </div>
        <p style={{ fontSize: '13.5px', lineHeight: '1.65', color: '#dde4f0' }}>
          {explanation.summary}
        </p>
      </div>

      {/* Key Findings */}
      {explanation.keyFindings?.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{
            fontSize:      '11px',
            fontWeight:    '700',
            color:         'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom:  '10px'
          }}>
            Key Performance Metrics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {explanation.keyFindings.map((item, idx) => (
              <div
                key={idx}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '13px', color: '#c4cfe0' }}
              >
                <CheckCircle2
                  size={14}
                  color="var(--accent-emerald)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <span style={{ lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Root Causes / Attribution */}
      {explanation.rootCauses?.length > 0 && (
        <div>
          <h3 style={{
            fontSize:      '11px',
            fontWeight:    '700',
            color:         'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom:  '10px'
          }}>
            {isGovernance ? '🔒 Governance Rules Applied' : '🔍 Root Cause Attribution'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
            {explanation.rootCauses.map((rc, idx) => {
              const badgeCls = IMPACT_BADGE[rc.impact] || 'badge-indigo';
              return (
                <div
                  key={idx}
                  style={{
                    background:   'rgba(0,0,0,0.28)',
                    border:       '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding:      '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)' }}>
                      {rc.title}
                    </span>
                    <span className={`badge ${badgeCls}`} style={{ fontSize: '10px', flexShrink: 0 }}>
                      {rc.impact}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {rc.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
