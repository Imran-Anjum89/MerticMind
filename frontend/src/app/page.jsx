'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import PresetPrompts from '../components/PresetPrompts';
import ChatBubble from '../components/ChatBubble';
import TransparencyModal from '../components/TransparencyModal';
import { Send, Sparkles, Loader2, MessageSquare, Trash2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator shown while agent is processing
// ─────────────────────────────────────────────────────────────────────────────
function TypingIndicator({ steps }) {
  const STEPS = [
    '1. Parsing question intent',
    '2. Generating governed Cube JSON',
    '3. Executing semantic layer query',
    '4. Root cause synthesis'
  ];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % STEPS.length);
    }, 900);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ paddingLeft: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Loader2 size={15} color="white" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-cyan)' }}>
          MetricMind Agent Orchestrating…
        </span>
      </div>

      <div className="typing-indicator" style={{ marginBottom: '10px', alignSelf: 'flex-start' }}>
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>

      <div className="step-pills">
        {STEPS.map((s, i) => (
          <span key={i} className={`step-pill ${i === activeStep ? 'active' : ''}`}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main MetricMind application
// ─────────────────────────────────────────────────────────────────────────────
export default function MetricMindApp() {
  const [question,        setQuestion]        = useState('');
  const [loading,         setLoading]         = useState(false);
  const [chatHistory,     setChatHistory]     = useState([]);  // [{question, response}]
  const [transparencyOpen, setTransparencyOpen] = useState(false);
  const [transparencyData, setTransparencyData] = useState(null);

  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);

  // Auto-scroll to bottom on new chat turns
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // ── Query agent ───────────────────────────────────────────────────────────
  async function queryAgent(questionText) {
    if (!questionText.trim() || loading) return;

    setLoading(true);
    try {
      const res  = await fetch('/api/agent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: questionText.trim() })
      });
      const data = await res.json();

      setChatHistory(prev => [...prev, { question: questionText.trim(), response: data }]);
    } catch (err) {
      console.error('Agent error:', err);
      setChatHistory(prev => [...prev, {
        question: questionText.trim(),
        response: {
          explanation: { summary: 'An error occurred while processing your question. Please try again.', keyFindings: [], rootCauses: [] },
          chartConfig: null,
          transparency: null
        }
      }]);
    } finally {
      setLoading(false);
      setQuestion('');
      inputRef.current?.focus();
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    queryAgent(question);
  };

  const handleSelectPrompt = (promptText) => {
    setQuestion(promptText);
    queryAgent(promptText);
  };

  const handleOpenTransparency = (tData) => {
    setTransparencyData(tData);
    setTransparencyOpen(true);
  };

  const clearHistory = () => {
    setChatHistory([]);
    setQuestion('');
  };

  return (
    <main>
      <Header />

      {/* Quick Analysis Presets */}
      <PresetPrompts onSelectPrompt={handleSelectPrompt} disabled={loading} />

      {/* ── Chat Thread ──────────────────────────────────────────────────── */}
      {chatHistory.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {/* Thread header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   '20px',
            paddingBottom:  '12px',
            borderBottom:   '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={15} color="var(--accent-cyan)" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                Conversation — {chatHistory.length} {chatHistory.length === 1 ? 'query' : 'queries'}
              </span>
            </div>
            <button
              onClick={clearHistory}
              className="btn-icon"
              title="Clear conversation"
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>

          {/* All conversation turns */}
          <div className="chat-thread">
            {chatHistory.map((turn, idx) => (
              <ChatBubble
                key={idx}
                index={idx}
                turn={turn}
                onOpenTransparency={handleOpenTransparency}
              />
            ))}

            {/* Typing indicator for current in-flight query */}
            {loading && (
              <div className="chat-turn" style={{ animation: 'fadeSlideUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                    background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>?</span>
                  </div>
                  <div style={{
                    padding: '10px 16px', borderRadius: '12px',
                    background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)',
                    fontSize: '14px', fontWeight: '500', color: '#e2e8f0'
                  }}>
                    {question || '…'}
                  </div>
                </div>
                <TypingIndicator />
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      )}

      {/* Empty state */}
      {chatHistory.length === 0 && !loading && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          color: 'var(--text-dim)', fontSize: '14px',
          background: 'rgba(14,22,40,0.4)',
          borderRadius: '16px', border: '1px dashed var(--border-subtle)',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠</div>
          <p style={{ fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            MetricMind Agentic BI is ready
          </p>
          <p style={{ fontSize: '13px' }}>
            Select a quick analysis preset above or type your question below.
          </p>
        </div>
      )}

      {/* ── Input Bar (sticky at bottom) ─────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        id="chat-input-form"
        style={{
          position:   'sticky',
          bottom:     '16px',
          zIndex:     100,
          marginTop:  chatHistory.length > 0 ? '0' : '0'
        }}
      >
        <div className="input-bar">
          <Sparkles size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={loading
              ? 'Agent is analyzing…'
              : 'Ask anything about your business metrics (e.g. Why did European margins drop last quarter?)…'
            }
            disabled={loading}
          />
          <button
            id="chat-submit-btn"
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-primary"
            style={{ flexShrink: 0 }}
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /><span>Analyzing…</span></>
              : <><Send size={15} /><span>Ask Agent</span></>
            }
          </button>
        </div>
      </form>

      {/* Transparency Inspection Modal */}
      <TransparencyModal
        isOpen={transparencyOpen}
        onClose={() => setTransparencyOpen(false)}
        transparencyData={transparencyData}
      />
    </main>
  );
}
