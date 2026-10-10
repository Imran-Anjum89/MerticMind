'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Database,
  Upload,
  RefreshCw,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Sparkles,
  Table,
  Check,
  ChevronRight,
  Download
} from 'lucide-react';

export default function AdminPanelModal({ isOpen, onClose, onDataUpdated }) {
  const [dataInfo, setDataInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('datasets'); // 'datasets' | 'upload' | 'verification'
  const [selectedTargetFile, setSelectedTargetFile] = useState('orders.csv');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [previewingFile, setPreviewingFile] = useState(null); // { fileName, preview, headers }

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Fetch data info on open
  useEffect(() => {
    if (isOpen) {
      fetchDataInfo();
      setMessage(null);
    }
  }, [isOpen]);

  async function fetchDataInfo() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.success) {
        setDataInfo(data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load datasets' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Handle warehouse reload
  async function handleReloadWarehouse() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reload' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchDataInfo();
        if (onDataUpdated) onDataUpdated();
      } else {
        setMessage({ type: 'error', text: data.error || 'Reload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Handle reset to defaults
  async function handleResetDefaults() {
    if (!window.confirm('Are you sure you want to restore default sample datasets? Any custom uploads will be replaced.')) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchDataInfo();
        if (onDataUpdated) onDataUpdated();
      } else {
        setMessage({ type: 'error', text: data.error || 'Reset failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Handle file selection
  function handleFileSelect(file) {
    if (!file) return;
    setSelectedFile(file);

    // Auto-detect target dataset from filename
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('order')) setSelectedTargetFile('orders.csv');
    else if (lowerName.includes('product')) setSelectedTargetFile('products.csv');
    else if (lowerName.includes('customer')) setSelectedTargetFile('customers.csv');
    else if (lowerName.includes('shipping')) setSelectedTargetFile('shipping_costs.csv');
    else if (lowerName.includes('material')) setSelectedTargetFile('material_costs.csv');
    else if (lowerName.includes('region')) setSelectedTargetFile('regions.csv');

    // Parse preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      const headers = lines[0]?.split(',').map(h => h.trim()) || [];
      const rows = lines.slice(1, 5).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });
      setFilePreview({
        name: file.name,
        size: file.size,
        totalLines: Math.max(0, lines.length - 1),
        headers,
        rows
      });
    };
    reader.readAsText(file);
  }

  // Handle file upload submit
  async function handleUploadSubmit() {
    if (!selectedFile) return;
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('targetFileName', selectedTargetFile);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchDataInfo();
        if (onDataUpdated) onDataUpdated();
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  const summary = dataInfo?.stats?.summary || {};
  const files = dataInfo?.files || [];

  return (
    <div
      id="admin-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4, 7, 14, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        id="admin-modal"
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '20px',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 50px rgba(99,102,241,0.2)'
        }}
      >
        {/* ── Modal Header ──────────────────────────────────────────────── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(10, 16, 32, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '11px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(99,102,241,0.45)'
            }}>
              <Sliders size={20} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px' }}>
                  Admin Data Control Studio
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                  Live Data Sync
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Upload business CSV files to update the warehouse — the AI Agent answers questions from this data.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleReloadWarehouse}
              disabled={loading || uploading}
              className="btn-icon"
              title="Re-execute dbt views and refresh SQLite engine"
              style={{ fontSize: '12px', padding: '7px 12px', gap: '6px' }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              Re-materialize
            </button>

            <button
              onClick={handleResetDefaults}
              disabled={loading || uploading}
              className="btn-icon"
              title="Reset datasets back to default demo data"
              style={{ fontSize: '12px', padding: '7px 12px', gap: '6px' }}
            >
              <RotateCcw size={13} />
              Reset Defaults
            </button>

            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Status Message Banner ─────────────────────────────────────── */}
        {message && (
          <div style={{
            padding: '12px 24px',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            borderBottom: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: message.type === 'success' ? '#34d399' : '#fb7185'
          }}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Warehouse KPI Cards ───────────────────────────────────────── */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(8, 12, 24, 0.4)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Total Orders
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#e2e8f0', marginTop: '4px' }}>
              {Number(summary.totalOrders || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-indigo)', marginTop: '2px' }}>
              in fact_sales model
            </div>
          </div>

          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Total Revenue
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
              ${Number(summary.totalRevenue || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Governed metric
            </div>
          </div>

          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Total Operating Costs
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#fb7185', marginTop: '4px' }}>
              ${Number(summary.totalCost || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Shipping + Materials
            </div>
          </div>

          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Net Profit / Margin
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
              {Number(summary.avgMargin || 0).toFixed(1)}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              ${Number(summary.totalProfit || 0).toLocaleString()} net
            </div>
          </div>

          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Transaction Dates
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#cbd5e1', marginTop: '6px' }}>
              {summary.minDate || 'N/A'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              thru {summary.maxDate || 'N/A'}
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ───────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px 0 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(10, 16, 32, 0.4)'
        }}>
          <button
            onClick={() => setActiveTab('datasets')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: activeTab === 'datasets' ? '700' : '500',
              color: activeTab === 'datasets' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'datasets' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Layers size={15} />
            Warehouse Datasets ({files.length})
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: activeTab === 'upload' ? '700' : '500',
              color: activeTab === 'upload' ? 'var(--accent-indigo)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'upload' ? '2px solid var(--accent-indigo)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Upload size={15} />
            Upload & Replace Dataset
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: activeTab === 'verification' ? '700' : '500',
              color: activeTab === 'verification' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'verification' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={15} />
            Data Breakdown Verification
          </button>
        </div>

        {/* ── Tab Content Area ─────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* TAB 1: DATASETS LIST */}
          {activeTab === 'datasets' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Active Semantic Files</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    These files feed the dbt staging views and the Cube.dev governed semantic layer.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="btn-primary"
                  style={{ fontSize: '12.5px', padding: '8px 14px' }}
                >
                  <Upload size={13} />
                  Upload New File
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '14px' }}>
                {files.map(f => (
                  <div
                    key={f.fileName}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      background: 'rgba(14, 22, 40, 0.7)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <FileSpreadsheet size={16} color="var(--accent-primary)" />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>
                              {f.fileName}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {f.sizeFormatted} · {f.rowCount.toLocaleString()} rows
                            </div>
                          </div>
                        </div>

                        <span className="badge badge-indigo" style={{ fontSize: '10px' }}>
                          {f.headers.length} cols
                        </span>
                      </div>

                      <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.4 }}>
                        {f.description}
                      </p>

                      <div style={{
                        fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                        background: 'rgba(6,10,20,0.6)', padding: '6px 10px', borderRadius: '6px',
                        marginBottom: '14px', overflowX: 'auto', whiteSpace: 'nowrap'
                      }}>
                        {f.headers.join(', ')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setPreviewingFile(f)}
                        className="btn-icon"
                        style={{ flex: 1, fontSize: '11.5px', justifyContent: 'center', padding: '6px 8px' }}
                      >
                        <Eye size={12} />
                        Preview
                      </button>

                      <a
                        href={`/api/admin/download?file=${f.fileName}`}
                        download={f.fileName}
                        className="btn-icon"
                        style={{
                          flex: 1,
                          fontSize: '11.5px',
                          justifyContent: 'center',
                          padding: '6px 8px',
                          color: 'var(--accent-emerald)',
                          textDecoration: 'none'
                        }}
                        title={`Download ${f.fileName} (.csv)`}
                      >
                        <Download size={12} />
                        Download
                      </a>

                      <button
                        onClick={() => {
                          setSelectedTargetFile(f.fileName);
                          setActiveTab('upload');
                        }}
                        className="btn-icon"
                        style={{ flex: 1, fontSize: '11.5px', justifyContent: 'center', padding: '6px 8px', color: 'var(--accent-cyan)' }}
                      >
                        <Upload size={12} />
                        Replace
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Preview Modal/Drawer */}
              {previewingFile && (
                <div style={{
                  marginTop: '20px', padding: '16px', borderRadius: '14px',
                  background: 'rgba(10, 16, 32, 0.9)', border: '1px solid rgba(99,102,241,0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Table size={15} color="var(--accent-cyan)" />
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>
                        Previewing {previewingFile.fileName} (First 3 Records)
                      </span>
                    </div>
                    <button
                      onClick={() => setPreviewingFile(null)}
                      className="btn-icon"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                    >
                      Close Preview
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                          {previewingFile.headers.map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewingFile.preview.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {previewingFile.headers.map(h => (
                              <td key={h} style={{ padding: '8px 12px', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                                {row[h]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD & REPLACE */}
          {activeTab === 'upload' && (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Upload Business Data File</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Upload a replacement CSV file. When uploaded, the agent warehouse will automatically re-parse and materialize views, enabling the AI agent to give answers matching your updated data.
                </p>
              </div>

              {/* Sample Data Download Card */}
              <div style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(6,182,212,0.07)',
                border: '1px solid rgba(6,182,212,0.25)',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Download size={16} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#e2e8f0' }}>
                    Download Ready-to-Use Sample Data (.csv)
                  </span>
                  <span className="badge badge-cyan" style={{ fontSize: '10px', marginLeft: 'auto' }}>
                    Agent Compatible
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Download a pre-formatted sample dataset to inspect the structure, customize rows (e.g. adjust revenue, date quarters, or products), and upload back to test agent answers:
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href="/api/admin/download?file=sample_orders_template.csv"
                    download="sample_orders_template.csv"
                    className="btn-primary"
                    style={{
                      fontSize: '12px',
                      padding: '7px 14px',
                      textDecoration: 'none',
                      borderRadius: '9px',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      boxShadow: '0 2px 10px rgba(6,182,212,0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Download size={13} />
                    Download Sample Orders Template (.csv)
                  </a>

                  <a
                    href="/api/admin/download?file=orders.csv"
                    download="orders.csv"
                    className="btn-icon"
                    style={{
                      fontSize: '12px',
                      padding: '7px 12px',
                      textDecoration: 'none',
                      color: '#cbd5e1'
                    }}
                    title="Download active orders dataset (960 rows)"
                  >
                    <Download size={13} />
                    Active orders.csv (960 rows)
                  </a>

                  <a
                    href="/api/admin/download?file=products.csv"
                    download="products.csv"
                    className="btn-icon"
                    style={{
                      fontSize: '12px',
                      padding: '7px 12px',
                      textDecoration: 'none',
                      color: '#cbd5e1'
                    }}
                    title="Download active products catalog"
                  >
                    <Download size={13} />
                    Active products.csv
                  </a>
                </div>
              </div>

              {/* Target dataset picker */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '8px', color: '#cbd5e1' }}>
                  Target Dataset in Semantic Warehouse:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {[
                    { name: 'orders.csv', label: 'Orders / Transactions', desc: 'order_id, date, customer_id, product_id, quantity, revenue' },
                    { name: 'products.csv', label: 'Products Catalog', desc: 'product_id, product_name, product_category' },
                    { name: 'customers.csv', label: 'Customer Master', desc: 'customer_id, customer_name, country, region' },
                    { name: 'shipping_costs.csv', label: 'Shipping Costs', desc: 'order_id, shipping_cost' },
                    { name: 'material_costs.csv', label: 'Material Costs', desc: 'order_id, material_cost' },
                    { name: 'regions.csv', label: 'Regions & Countries', desc: 'region_id, region, country' }
                  ].map(t => (
                    <div
                      key={t.name}
                      onClick={() => setSelectedTargetFile(t.name)}
                      style={{
                        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                        background: selectedTargetFile === t.name ? 'rgba(99,102,241,0.2)' : 'rgba(14,22,40,0.6)',
                        border: selectedTargetFile === t.name ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                        transition: 'all 0.18s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: selectedTargetFile === t.name ? 'white' : '#cbd5e1' }}>
                          {t.name}
                        </span>
                        {selectedTargetFile === t.name && <Check size={14} color="var(--accent-cyan)" />}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(99,102,241,0.4)',
                  borderRadius: '16px',
                  padding: '36px 24px',
                  textAlign: 'center',
                  background: 'rgba(14, 22, 40, 0.45)',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'border-color 0.2s, background 0.2s'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />

                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px auto'
                }}>
                  <Upload size={24} color="var(--accent-primary)" />
                </div>

                <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Click or Drag CSV File Here to Upload'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Accepts standard comma-separated `.csv` files.
                </div>
              </div>

              {/* File Preview before upload */}
              {filePreview && (
                <div style={{
                  padding: '16px', borderRadius: '12px',
                  background: 'rgba(10, 16, 32, 0.8)', border: '1px solid rgba(99,102,241,0.3)',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                      Detected File Validation
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                      {filePreview.totalLines.toLocaleString()} Data Rows Detected
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Columns: <span style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>{filePreview.headers.join(', ')}</span>
                  </div>

                  {filePreview.rows.length > 0 && (
                    <div style={{ overflowX: 'auto', maxHeight: '140px' }}>
                      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {filePreview.headers.slice(0, 6).map(h => (
                              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#94a3b8' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filePreview.rows.slice(0, 3).map((r, i) => (
                            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                              {filePreview.headers.slice(0, 6).map(h => (
                                <td key={h} style={{ padding: '6px 10px', color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{r[h]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  disabled={!selectedFile || uploading}
                  className="btn-icon"
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                >
                  Clear Selection
                </button>

                <button
                  onClick={handleUploadSubmit}
                  disabled={!selectedFile || uploading}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: '13px' }}
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      Uploading & Materializing...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Save as {selectedTargetFile} & Re-materialize
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BREAKDOWN VERIFICATION */}
          {activeTab === 'verification' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Active Warehouse Breakdown</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Aggregated numbers computed dynamically by the SQLite / Cube engine from your current data files.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                {/* Regional Breakdown */}
                <div style={{
                  padding: '16px', borderRadius: '14px',
                  background: 'rgba(14, 22, 40, 0.65)', border: '1px solid var(--border-subtle)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '12px' }}>
                    Revenue & Order Volume by Region
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)' }}>Region</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-muted)' }}>Orders</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-muted)' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dataInfo?.stats?.regions || []).map(r => (
                        <tr key={r.region} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px', fontWeight: '600', color: '#e2e8f0' }}>{r.region}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#94a3b8' }}>{Number(r.orders).toLocaleString()}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                            ${Number(r.revenue).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Product Category Breakdown */}
                <div style={{
                  padding: '16px', borderRadius: '14px',
                  background: 'rgba(14, 22, 40, 0.65)', border: '1px solid var(--border-subtle)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-indigo)', marginBottom: '12px' }}>
                    Top Product Categories
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)' }}>Category</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-muted)' }}>Orders</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-muted)' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dataInfo?.stats?.categories || []).map(c => (
                        <tr key={c.product_category} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px', fontWeight: '600', color: '#e2e8f0' }}>{c.product_category}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#94a3b8' }}>{Number(c.orders).toLocaleString()}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: 'var(--accent-indigo)' }}>
                            ${Number(c.revenue).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ──────────────────────────────────────────────── */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(8, 12, 24, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Database size={13} color="var(--accent-emerald)" />
            <span>Warehouse Path: </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              {dataInfo?.dataDir || 'data/'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '8px 18px' }}
          >
            Done & Ask Agent
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
