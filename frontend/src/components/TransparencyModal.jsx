'use client';

import React, { useState, useEffect } from 'react';
import { X, Code, Database, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function TransparencyModal({ isOpen, onClose, transparencyData }) {
  const [activeTab, setActiveTab]   = useState('cubeQuery');
  const [schemaData, setSchemaData] = useState(null);

  useEffect(() => {
    if (isOpen && !schemaData) {
      fetch('/api/schema')
        .then(res  => res.json())
        .then(data => setSchemaData(data))
        .catch(err => console.error(err));
    }
  }, [isOpen, schemaData]);

  // Reset to first tab when new transparency data arrives
  useEffect(() => {
    if (isOpen) setActiveTab('cubeQuery');
  }, [isOpen, transparencyData]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'cubeQuery', label: 'Cube API Payload',      icon: Code,          badge: 'badge-indigo' },
    { id: 'sql',       label: 'Governed SQL',           icon: Database,      badge: 'badge-emerald' },
    { id: 'schema',    label: 'Semantic Schema',        icon: CheckCircle2,  badge: 'badge-cyan' },
    { id: 'cost',      label: 'Query Cost',             icon: AlertTriangle, badge: 'badge-amber' }
  ];

  const costEst = transparencyData?.costEstimate;

  return (
    <div
      id="transparency-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        background:      'rgba(4, 7, 14, 0.88)',
        backdropFilter:  'blur(16px)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '20px'
      }}
    >
      <div
        id="transparency-modal"
        className="glass-panel"
        style={{
          width:         '100%',
          maxWidth:      '880px',
          maxHeight:     '88vh',
          display:       'flex',
          flexDirection: 'column',
          overflow:      'hidden',
          border:        '1px solid var(--border-glow)'
        }}
      >
        {/* Header */}
        <div style={{
          padding:        '18px 22px',
          borderBottom:   '1px solid var(--border-subtle)',
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          background:     'rgba(0,0,0,0.3)'
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--accent-emerald)" />
              Governed Semantic Transparency Inspection
            </h2>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Verify the exact Cube.dev JSON payload, compiled Snowflake SQL, and schema definitions used by the AI agent
            </p>
          </div>
          <button
            id="transparency-close-btn"
            onClick={onClose}
            style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', lineHeight: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '6px', padding: '10px 22px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="btn-secondary"
                style={{
                  borderRadius: '8px',
                  fontSize:     '12px',
                  background:   isActive ? 'rgba(99,102,241,0.18)' : undefined,
                  borderColor:  isActive ? 'rgba(99,102,241,0.45)' : undefined,
                  color:        isActive ? 'var(--accent-primary)' : undefined,
                  fontWeight:   isActive ? '700' : '500'
                }}
              >
                <TabIcon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>

          {/* ── Cube API Payload ─────────────────────────────────────────── */}
          {activeTab === 'cubeQuery' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <Info size={13} color="var(--accent-cyan)" />
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  The AI agent translates your question into this governed Cube.dev JSON API payload — <strong style={{ color: 'var(--text-main)' }}>no raw SQL is ever generated by the LLM</strong>.
                </p>
              </div>
              <pre className="mono" style={{
                background:   '#04070e',
                padding:      '16px',
                borderRadius: '10px',
                fontSize:     '12.5px',
                color:        '#38bdf8',
                overflowX:    'auto',
                border:       '1px solid rgba(56,189,248,0.12)',
                lineHeight:   1.6
              }}>
                {JSON.stringify(transparencyData?.cubeQuery || {}, null, 2)}
              </pre>

              {transparencyData?.secondaryQueries?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '600', marginBottom: '10px' }}>
                    Secondary Governed Queries (Multi-Step Reasoning):
                  </h4>
                  {transparencyData.secondaryQueries.map((sq, idx) => (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <span className="badge badge-indigo" style={{ marginBottom: '6px', fontSize: '10.5px' }}>{sq.name}</span>
                      <pre className="mono" style={{
                        background: '#04070e', padding: '12px', borderRadius: '8px',
                        fontSize: '12px', color: '#818cf8', border: '1px solid rgba(129,140,248,0.12)', lineHeight: 1.55
                      }}>
                        {JSON.stringify(sq.query || {}, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Governed SQL ─────────────────────────────────────────────── */}
          {activeTab === 'sql' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <Info size={13} color="var(--accent-emerald)" />
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  The Semantic Layer compiles the JSON payload into deterministic, governed SQL. Row-limited to 1,000 max.
                </p>
              </div>
              <pre className="mono" style={{
                background:   '#04070e',
                padding:      '16px',
                borderRadius: '10px',
                fontSize:     '12.5px',
                color:        '#4ade80',
                whiteSpace:   'pre-wrap',
                wordBreak:    'break-word',
                border:       '1px solid rgba(74,222,128,0.12)',
                lineHeight:   1.65
              }}>
                {transparencyData?.executedSql || 'No SQL recorded for this query.'}
              </pre>

              {transparencyData?.secondaryQueries?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '600', marginBottom: '10px' }}>
                    Secondary Queries SQL:
                  </h4>
                  {transparencyData.secondaryQueries.map((sq, idx) => (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <span className="badge badge-emerald" style={{ marginBottom: '6px', fontSize: '10.5px' }}>{sq.name}</span>
                      <pre className="mono" style={{
                        background: '#04070e', padding: '12px', borderRadius: '8px',
                        fontSize: '12px', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.08)', lineHeight: 1.55
                      }}>
                        {sq.sql}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Semantic Schema ───────────────────────────────────────────── */}
          {activeTab === 'schema' && (
            <div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                All metrics defined centrally in <code style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>cube/model/cubes/Sales.js</code>. The AI agent <strong style={{ color: 'var(--text-main)' }}>cannot override these calculations</strong>.
              </p>

              {schemaData?.governanceRules && (
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🔒 Governance Rules
                  </h4>
                  {schemaData.governanceRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                      <CheckCircle2 size={12} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginBottom: '10px', fontWeight: '700' }}>
                    Governed Measures
                  </h4>
                  {schemaData?.measures?.map((m, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '7px', marginBottom: '6px', fontSize: '12px' }}>
                      <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>{m.name}</strong>
                      <code style={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{m.sql}</code>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontSize: '12px', color: 'var(--accent-emerald)', marginBottom: '10px', fontWeight: '700' }}>
                    Governed Dimensions
                  </h4>
                  {schemaData?.dimensions?.map((d, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '7px', marginBottom: '6px', fontSize: '12px' }}>
                      <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>{d.name}</strong>
                      <code style={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{d.sql}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Query Cost Estimate ───────────────────────────────────────── */}
          {activeTab === 'cost' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '16px' }}>
                <Info size={13} color="var(--accent-amber)" />
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  MetricMind estimates the governance cost of each query — row limits enforced, expensive queries warned.
                </p>
              </div>

              {costEst ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Rows Returned',    value: costEst.rowsReturned,   badge: 'badge-cyan' },
                    { label: 'Row Limit Cap',     value: costEst.rowLimit,       badge: 'badge-emerald' },
                    { label: 'Dimensions',        value: costEst.dimensionCount, badge: 'badge-indigo' },
                    { label: 'Measures',          value: costEst.measureCount,   badge: 'badge-violet' },
                    { label: 'Filters Applied',   value: costEst.filterCount,    badge: 'badge-amber' },
                    { label: 'Complexity Rating', value: costEst.complexityRating, badge: costEst.complexityRating === 'Low' ? 'badge-emerald' : 'badge-amber' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                      <span className={`badge ${item.badge}`} style={{ fontSize: '13px', padding: '4px 12px' }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>No cost estimate available for this query.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
