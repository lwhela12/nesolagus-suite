'use client';

/**
 * Pushes brand colors + compact flag into CSS variables so the whole app
 * can read them. Values persist in localStorage from the Settings page.
 */
type BrandState = {
  brandFrom?: string; // e.g. "#64B37A"
  brandTo?: string;   // e.g. "#2F6D49"
  compact?: boolean;
};

function readBrandState(): BrandState {
  try {
    const raw = localStorage.getItem('hollow-ui:brand');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function ClientThemeVars() {
  if (typeof window !== 'undefined') {
    const { brandFrom, brandTo, compact } = readBrandState();

    // Defaults match what we’ve been using in charts/buttons
    const from = brandFrom || '#64B37A';
    const to   = brandTo   || '#2F6D49';

    const root = document.documentElement;
    root.style.setProperty('--brand-from', from);
    root.style.setProperty('--brand-to', to);
    root.style.setProperty('--compact-ui', compact ? '1' : '0');
  }
  return null;
}
