import React from 'react';
import styled from 'styled-components';
import { AccentKey, dashboardPalette, fontStack } from '../theme';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

export interface SegmentDatum {
  label: string;
  value: number;
  color?: string;
}

export interface SegmentDonutProps {
  data: SegmentDatum[];
  totalLabel?: string;
  accent?: AccentKey;
  formatValue?: (value: number) => string;
}

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 260px) 1fr;
  gap: 16px;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LegendList = styled.ul`
  display: grid;
  gap: 10px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
`;

const LegendItem = styled.li<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #ffffff;
  box-shadow: 0 12px 30px -24px rgba(15, 23, 42, 0.35);

  &:before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: ${({ $color }) => $color};
    margin-right: 10px;
  }
`;

const LegendLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LegendValue = styled.span`
  font-family: ${fontStack.number};
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
`;

const TotalBadge = styled.div<{ $accent: AccentKey }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ $accent }) => dashboardPalette[$accent].surface};
  color: ${({ $accent }) => dashboardPalette[$accent].text};
  margin-bottom: 16px;
`;

const DefaultColors = ['#16a34a', '#0ea5e9', '#7c3aed', '#f59e0b', '#fb7185', '#22d3ee'];

export const SegmentDonut: React.FC<SegmentDonutProps> = ({
  data,
  totalLabel,
  accent = 'emerald',
  formatValue,
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No segmentation data available.</span>;
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div>
      {totalLabel && (
        <TotalBadge $accent={accent}>
          <span>{totalLabel}</span>
          <span>{formatValue ? formatValue(total) : total}</span>
        </TotalBadge>
      )}
      <ChartContainer>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data as any}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive
              >
                {data.map((item, idx) => (
                  <Cell
                    key={item.label}
                    fill={item.color ?? DefaultColors[idx % DefaultColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name, entry) => [
                  formatValue ? formatValue(value) : value,
                  entry && typeof entry?.name === 'string' ? entry.name : '',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <LegendList>
          {data.map((item, idx) => (
            <LegendItem
              key={item.label}
              $color={item.color ?? DefaultColors[idx % DefaultColors.length]}
            >
              <LegendLabel>{item.label}</LegendLabel>
              <LegendValue>{formatValue ? formatValue(item.value) : item.value}</LegendValue>
            </LegendItem>
          ))}
        </LegendList>
      </ChartContainer>
    </div>
  );
};
