'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieConsentBanner({ onOpenPolicy }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('metricmind_cookie_consent');
      if (!consent) {
        setVisible(true);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('metricmind_cookie_consent', 'accepted');
    }
    setVisible(false);
  };

  const handleDecline = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('metricmind_cookie_consent', 'essential_only');
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      id="cookie-consent-banner"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '840px',
        margin: '0 auto',
        zIndex: 9999,
        background: 'rgba(10, 16, 32, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.2)',
        borderRadius: '16px',
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        animation: 'fadeSlideUp 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 400px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Cookie size={20} color="var(--accent-primary)" />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Cookie Consent & Data Governance (Standard #5)</span>
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>GDPR & ePrivacy</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
            We use essential analytical cookies to run governed Cube queries and preserve session state. Zero advertising trackers.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={onOpenPolicy}
          className="btn-icon"
          style={{ fontSize: '12px', padding: '7px 12px' }}
        >
          View Policy (#4)
        </button>

        <button
          onClick={handleDecline}
          className="btn-icon"
          style={{ fontSize: '12px', padding: '7px 12px' }}
        >
          Essential Only
        </button>

        <button
          onClick={handleAccept}
          className="btn-primary"
          style={{ fontSize: '12px', padding: '7px 16px' }}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
