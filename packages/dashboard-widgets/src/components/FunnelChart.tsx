import React from 'react';
import styled from 'styled-components';
import { AccentKey, dashboardPalette, fontStack } from '../theme';

export interface FunnelDatum {
  label: string;
  value: number;
  hint?: string;
}

export interface FunnelChartProps {
  data: FunnelDatum[];
  maxValue?: number;
  accent?: AccentKey;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 12px;
  align-items: center;
`;

const Label = styled.div`
  font-size: 0.9rem;
  color: #334155;
`;

const Hint = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
`;

const BarTrack = styled.div<{ $accent: AccentKey }>`
  position: relative;
  height: 14px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $accent }) =>
      `linear-gradient(90deg, ${dashboardPalette[$accent].gradientFrom} 0%, ${dashboardPalette[$accent].gradientTo} 100%)`};
    border-radius: inherit;
    transform-origin: left center;
    transform: scaleX(var(--progress, 0));
    transition: transform 0.4s ease;
  }
`;

const Value = styled.div`
  font-family: ${fontStack.number};
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  text-align: right;
`;

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  maxValue,
  accent = 'emerald',
  showValue = true,
  valueFormat,
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <Hint>No funnel data available.</Hint>;
  }

  const computedMax = maxValue ?? Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <Wrapper>
      {data.map((entry) => {
        const progress = Math.min(1, Math.max(0, entry.value / computedMax));
        return (
          <Row key={entry.label}>
            <div>
              <Label>{entry.label}</Label>
              {entry.hint && <Hint>{entry.hint}</Hint>}
            </div>
            <BarTrack $accent={accent} style={{ '--progress': progress } as React.CSSProperties} />
            {showValue && (
              <Value>{valueFormat ? valueFormat(entry.value) : `${entry.value}`}</Value>
            )}
          </Row>
        );
      })}
    </Wrapper>
  );
};
