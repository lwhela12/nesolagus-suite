'use client';

import React from 'react';

export const BRAND = {
  deepestSea: '#032E46',
  riverRock:  '#D9D9D9',
  augusta:    '#64B37A',
  augustaL1:  '#86C99B',
  augustaD1:  '#479963',
};

export default function GradientBar({
  pct,
  height = 10,
  srLabel,
}: {
  pct: number;          // 0-100
  height?: number;      // px
  srLabel?: string;     // optional aria label
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div aria-label={srLabel}>
      <div
        className="w-full rounded-full"
        style={{
          height,
          backgroundColor: `${BRAND.riverRock}66`, // light track
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${BRAND.augustaL1} 0%, ${BRAND.augustaD1} 100%)`,
          }}
        />
      </div>
    </div>
  );
}
