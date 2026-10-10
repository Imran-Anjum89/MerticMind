'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import AdminPanelModal from '../../components/AdminPanelModal';
import Link from 'next/link';
import { ArrowLeft, Sliders, Database, Sparkles } from 'lucide-react';

export default function AdminPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <main>
      <Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '13px', fontWeight: '600'
        }}>
          <ArrowLeft size={16} />
          Back to Conversational Agent
        </Link>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
          style={{ fontSize: '13px' }}
        >
          <Sliders size={14} />
          Open Admin Control Panel
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45)'
        }}>
          <Database size={28} color="white" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
          MetricMind Data Administration
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '540px', margin: '0 auto 24px auto' }}>
          Upload new CSV files (Orders, Products, Customers, Shipping, or Materials) to update your semantic warehouse. All queries asked to the conversational agent will immediately utilize the updated dataset.
        </p>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
          style={{ padding: '12px 28px', fontSize: '14px' }}
        >
          Launch Data Control Studio
        </button>
      </div>

      <AdminPanelModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
