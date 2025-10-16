import React from 'react';
import styled, { css } from 'styled-components';
import { AccentKey, dashboardPalette, fontStack, cardShadow } from '../theme';

type DeltaDirection = 'up' | 'down' | 'neutral';
type DeltaTone = 'positive' | 'negative' | 'neutral';

export interface KpiDelta {
  value: string;
  direction?: DeltaDirection;
  tone?: DeltaTone;
  label?: string;
}

export interface KpiStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  delta?: KpiDelta;
  footnote?: string;
  accent?: AccentKey;
  compact?: boolean;
  align?: 'left' | 'center';
}

const Card = styled.div<{ $compact?: boolean; $align: 'left' | 'center' }>`
  background: #ffffff;
  border-radius: 20px;
  padding: ${({ $compact }) => ($compact ? '18px 20px' : '24px 28px')};
  box-shadow: ${cardShadow};
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? '12px' : '16px')};
  text-align: ${({ $align }) => $align};
`;

const TitleRow = styled.div<{ $align: 'left' | 'center' }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'space-between')};
  gap: 12px;
`;

const IconWrap = styled.div<{ $accent: AccentKey }>`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $accent }) => dashboardPalette[$accent].surface};
  color: ${({ $accent }) => dashboardPalette[$accent].text};
`;

const Title = styled.h3`
  font-family: ${fontStack.title};
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  margin: 0;
`;

const ValueRow = styled.div<{ $align: 'left' | 'center' }>`
  display: flex;
  align-items: baseline;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'space-between')};
  gap: 16px;
`;

const Value = styled.span<{ $accent: AccentKey }>`
  font-family: ${fontStack.number};
  font-size: 2.25rem;
  font-weight: 700;
  color: ${({ $accent }) => dashboardPalette[$accent].text};
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
`;

const Footnote = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
`;

const DeltaPill = styled.span<{ $tone: DeltaTone; $direction: DeltaDirection }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;

  ${({ $tone }) => {
    switch ($tone) {
      case 'positive':
        return css`
          background: rgba(34, 197, 94, 0.12);
          color: #15803d;
        `;
      case 'negative':
        return css`
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
        `;
      default:
        return css`
          background: rgba(148, 163, 184, 0.16);
          color: #475569;
        `;
    }
  }}
`;

const DirectionGlyph: React.FC<{ direction: DeltaDirection }> = ({ direction }) => {
  if (direction === 'up') {
    return <span style={{ fontSize: '0.85rem' }}>▲</span>;
  }
  if (direction === 'down') {
    return <span style={{ fontSize: '0.85rem' }}>▼</span>;
  }
  return <span style={{ fontSize: '0.85rem' }}>•</span>;
};

export const KpiStatCard: React.FC<KpiStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  delta,
  footnote,
  accent = 'emerald',
  compact = false,
  align = 'left',
}) => {
  return (
    <Card $compact={compact} $align={align}>
      <TitleRow $align={align}>
        <Title>{title}</Title>
        {icon && <IconWrap $accent={accent}>{icon}</IconWrap>}
      </TitleRow>
      <ValueRow $align={align}>
        <div>
          <Value $accent={accent}>{value}</Value>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </div>
        {delta && (
          <DeltaPill $tone={delta.tone ?? 'neutral'} $direction={delta.direction ?? 'neutral'}>
            <DirectionGlyph direction={delta.direction ?? 'neutral'} />
            <span>{delta.value}</span>
            {delta.label && <span>{delta.label}</span>}
          </DeltaPill>
        )}
      </ValueRow>
      {footnote && <Footnote>{footnote}</Footnote>}
    </Card>
  );
};
