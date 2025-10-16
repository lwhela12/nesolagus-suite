// src/components/ui/ClientThemeVars.tsx
'use client';

import { useEffect } from 'react';

export default function ClientThemeVars() {
  useEffect(() => {
    // Read demo UI prefs from localStorage (if present)
    const raw = typeof window !== 'undefined' ? localStorage.getItem('uiPrefs') : null;
    let prefs: any = null;
    try { prefs = raw ? JSON.parse(raw) : null; } catch {}

    const from = prefs?.gradientFrom ?? '#64B37A';
    const to   = prefs?.gradientTo   ?? '#2F6D49';
    const compact = !!prefs?.compact;

    const root = document.documentElement;
    root.style.setProperty('--brand-gradient-from', from);
    root.style.setProperty('--brand-gradient-to', to);
    root.style.setProperty('--ui-compact', compact ? '1' : '0');
  }, []);

  return null;
}
