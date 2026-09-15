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