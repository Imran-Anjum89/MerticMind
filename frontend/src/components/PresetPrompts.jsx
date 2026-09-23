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

