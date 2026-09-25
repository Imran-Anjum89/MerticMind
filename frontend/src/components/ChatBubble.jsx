'use client';

import React from 'react';
import { Bot, User, CheckCircle2, TrendingDown, AlertTriangle, Eye, Zap, Clock } from 'lucide-react';
import AnalysisCard from './AnalysisCard';
import ChartViewer from './ChartViewer';

// ─────────────────────────────────────────────────────────────────────────────
// Scenario metadata for badges
// ─────────────────────────────────────────────────────────────────────────────
const SCENARIO_META = {
    ROOT_CAUSE: { label: 'Root Cause Analysis', badge: 'badge-rose', icon: TrendingDown },
    REGIONAL_OVERVIEW: { label: 'Regional Overview', badge: 'badge-cyan', icon: Zap },
    COST_BREAKDOWN: { label: 'Cost Breakdown', badge: 'badge-amber', icon: AlertTriangle },
    SEGMENT_ANALYSIS: { label: 'Segment Analysis', badge: 'badge-violet', icon: Zap },
    PRODUCT_ANALYSIS: { label: 'Product Analysis', badge: 'badge-indigo', icon: Zap },
    COST_GOVERNANCE: { label: 'Governance Audit', badge: 'badge-emerald', icon: CheckCircle2 }
};
