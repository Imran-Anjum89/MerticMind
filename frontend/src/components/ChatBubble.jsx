'use client';

import React from 'react';
import { Bot, User, CheckCircle2, TrendingDown, AlertTriangle, Eye, Zap, Clock } from 'lucide-react';
import AnalysisCard from './AnalysisCard';
import ChartViewer from './ChartViewer';

// Scenario metadata for rendering the AI response bubble
const SCENARIO_META = {
    ROOT_CAUSE: { label: 'Root Cause Analysis', badge: 'badge-rose', icon: TrendingDown },
    REGIONAL_OVERVIEW: { label: 'Regional Overview', badge: 'badge-cyan', icon: Zap },
    COST_BREAKDOWN: { label: 'Cost Breakdown', badge: 'badge-amber', icon: AlertTriangle },
    SEGMENT_ANALYSIS: { label: 'Segment Analysis', badge: 'badge-violet', icon: Zap },
    PRODUCT_ANALYSIS: { label: 'Product Analysis', badge: 'badge-indigo', icon: Zap },
    COST_GOVERNANCE: { label: 'Governance Audit', badge: 'badge-emerald', icon: CheckCircle2 }
};

// ChatBubble component renders a single turn in the chat, including the user's question and the AI's response

export default function ChatBubble({ turn, index, onOpenTransparency }) {
  const { question, response } = turn;
  const scenario = response?.scenario || 'REGIONAL_OVERVIEW';
  const meta     = SCENARIO_META[scenario] || SCENARIO_META.REGIONAL_OVERVIEW;
  const MetaIcon = meta.icon;

  return (
    <div className="chat-turn" id={`turn-${index}`}>
      {/* ── User question bubble ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
          background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <User size={15} color="var(--accent-primary)" />
        </div>
        <div className="chat-bubble-user">
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>
            {question}
          </span>
        </div>
      </div>

      {/* ── AI response ─────────────────────────────────────────────────── */}
      <div className="chat-bubble-ai" style={{ paddingLeft: '40px' }}>
        {/* Agent meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(99,102,241,0.35)'
          }}>
            <Bot size={15} color="white" />
          </div>

          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
            MetricMind Agent
          </span>

          <span className={`badge ${meta.badge}`}>
            <MetaIcon size={11} />
            {meta.label}
          </span>

          {response?.stepsExecuted > 1 && (
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
              <Clock size={10} />
              {response.stepsExecuted} governed queries
            </span>
          )}

          <button
            onClick={() => onOpenTransparency(response?.transparency)}
            className="btn-icon"
            style={{ marginLeft: 'auto' }}
          >
            <Eye size={12} />
            View API & SQL
          </button>
        </div>

        {/* Analysis card */}
        <AnalysisCard
          explanation={response?.explanation}
          scenario={scenario}
        />

        {/* Chart */}
        <ChartViewer chartConfig={response?.chartConfig} />
      </div>
    </div>
  );
}
