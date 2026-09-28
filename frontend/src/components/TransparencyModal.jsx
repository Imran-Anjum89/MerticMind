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
      </div>
    </div>
  );
}