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

}