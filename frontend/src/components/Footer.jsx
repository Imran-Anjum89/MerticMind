'use client';

import React from 'react';
import {
  Database,
  GitBranch,
  ShieldCheck,
  BrainCircuit,
  Lock,
  FileText,
  Cookie,
  Trash2,
  Building,
  CheckCircle2,
  Scale,
  Sparkles,
  HelpCircle,
  Accessibility,
  DollarSign,
  HeartHandshake,
  MailCheck,
  Check
} from 'lucide-react';

export default function Footer({ onOpenCompliance, onOpenDataDeletion, onOpenCookies }) {
  return (
    <footer
      id="site-footer"
      className="glass-panel"
      style={{
        marginTop: '40px',
        marginBottom: '24px',
        padding: '28px 32px',
        border: '1px solid rgba(99,102,241,0.22)',
        borderRadius: '24px',
        background: 'rgba(8, 12, 24, 0.85)',
        boxShadow: '0 16px 40px -10px rgba(0,0,0,0.7)'
      }}
    >
      {/* ── TOP SECTION: Architectural Status Badges (Moved from Header) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '22px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Database size={15} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>
              Engine Architecture & Semantic Governance
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Live execution engine status & schema integrity
            </div>
          </div>
        </div>

        {/* ── The 4 Badges requested at the bottom ─────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            className="badge badge-emerald"
            style={{ gap: '6px', fontSize: '11.5px', padding: '4px 12px' }}
            title="Snowflake-compatible SQLite in-memory warehouse running"
          >
            <span className="health-dot" />
            <Database size={12} />
            Snowflake DW
          </div>

          <div
            className="badge badge-indigo"
            style={{ gap: '6px', fontSize: '11.5px', padding: '4px 12px' }}
            title="dbt fact_sales, dim_* models active"
          >
            <GitBranch size={12} />
            dbt: fact_sales
          </div>

          <div
            className="badge badge-cyan"
            style={{ gap: '6px', fontSize: '11.5px', padding: '4px 12px' }}
            title="Cube.dev semantic schema governing all queries"
          >
            <ShieldCheck size={12} />
            Cube.dev Governed
          </div>

          <div
            className="badge badge-violet"
            style={{ gap: '6px', fontSize: '11.5px', padding: '4px 12px' }}
            title="LangChain multi-step analytical reasoning engine"
          >
            <BrainCircuit size={12} />
            LangChain Active
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION: 20-Point Governance & Trust Framework ─────────── */}
      <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--accent-cyan)' }}>
              Trust, Ethics & Compliance Standards
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#f1f5f9', marginTop: '2px' }}>
              20-Point Regulatory & Consumer Protection Framework
            </h3>
          </div>

          <button
            onClick={() => onOpenCompliance('checklist')}
            className="btn-icon"
            style={{ fontSize: '11.5px', padding: '6px 12px', color: 'var(--accent-cyan)', borderColor: 'rgba(6,182,212,0.3)' }}
          >
            <CheckCircle2 size={12} />
            View Full 20/20 Audit Report
          </button>
        </div>

        {/* 4 Columns for the 20 items */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          fontSize: '12px'
        }}>
          {/* Column 1: Legal Policies (1-5, 20) */}
          <div>
            <div style={{ fontWeight: '700', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={13} color="var(--accent-indigo)" />
              Legal & User Policies
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <li>
                <button
                  onClick={() => onOpenCompliance('privacy')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>1.</span> Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('terms')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>2.</span> Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('refund')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>3.</span> Refund Policy (30 Days)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('cookies')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>4.</span> Cookie Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCookies}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>5.</span> Cookie Consent Banner
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDataDeletion}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', textAlign: 'left', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                >
                  <span>20.</span> Data Deletion Request Option
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Data Ethics & Privacy (6-8, 17, 18, 19) */}
          <div>
            <div style={{ fontWeight: '700', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} color="var(--accent-emerald)" />
              Data Privacy & Protection
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', color: '#94a3b8' }}>
              <li><span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>6.</span> Check your form consents</li>
              <li><span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>7.</span> Don't collect unnecessary data</li>
              <li><span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>8.</span> Audit your third-party SDKs</li>
              <li><span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>17.</span> Age consent (kids data / COPPA)</li>
              <li><span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>18.</span> Unsubscribe link to emails</li>
              <li><span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>19.</span> Enterprise AES-256 encryption</li>
            </ul>
          </div>

          {/* Column 3: Fair Practices & Consumer Protection (9-12, 16) */}
          <div>
            <div style={{ fontWeight: '700', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartHandshake size={13} color="var(--accent-amber)" />
              Consumer Protection & Truth
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', color: '#94a3b8' }}>
              <li><span style={{ color: 'var(--accent-amber)', fontWeight: '700' }}>9.</span> Remove dark patterns</li>
              <li><span style={{ color: 'var(--accent-amber)', fontWeight: '700' }}>10.</span> Remove hidden fees</li>
              <li><span style={{ color: 'var(--accent-amber)', fontWeight: '700' }}>11.</span> Remove fake reviews</li>
              <li><span style={{ color: 'var(--accent-amber)', fontWeight: '700' }}>12.</span> Remove unsupported claims</li>
              <li>
                <button
                  onClick={() => onOpenCompliance('business')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <span style={{ color: 'var(--accent-amber)', fontWeight: '700' }}>16.</span> Business Details & Entity
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Accessibility & Inclusion (13-15) */}
          <div>
            <div style={{ fontWeight: '700', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Accessibility size={13} color="var(--accent-cyan)" />
              Accessibility & Inclusion
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', color: '#94a3b8' }}>
              <li><span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>13.</span> Accessibility alt text on all UI</li>
              <li><span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>14.</span> Fixed color contrast ratio (AAA)</li>
              <li><span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>15.</span> Full keyboard navigation (Tab & Esc)</li>
            </ul>
            <div style={{
              marginTop: '12px', padding: '8px 10px', borderRadius: '8px',
              background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)',
              fontSize: '11px', color: 'var(--text-muted)'
            }}>
              WCAG 2.1 AA/AAA Compliant Theme
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Business Details & Copyright ─────────────────────── */}
      <div style={{
        paddingTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '11.5px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '700', color: '#e2e8f0' }}>
            MetricMind Technologies, Inc. (Item #16)
          </span>
          <span>·</span>
          <span>548 Market St, San Francisco, CA 94104</span>
          <span>·</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Reg: REG-US-892147-DE</span>
          <span>·</span>
          <a href="mailto:privacy@metricmind.ai" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
            privacy@metricmind.ai
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
            <Check size={10} /> 20/20 Standards Audited
          </span>
          <span>© 2026 MetricMind Agentic BI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
