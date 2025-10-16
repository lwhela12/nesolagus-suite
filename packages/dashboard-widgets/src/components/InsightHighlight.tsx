import React from 'react';
import styled from 'styled-components';
import { AccentKey, dashboardPalette, fontStack } from '../theme';

export interface InsightHighlightProps {
  title: string;
  body: string;
  eyebrow?: string;
  accent?: AccentKey;
  icon?: React.ReactNode;
  footer?: string;
}

const Card = styled.article<{ $accent: AccentKey }>`
  border-radius: 18px;
  padding: 22px 24px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 45px -30px rgba(15, 23, 42, 0.35);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg,
      ${({ $accent }) => dashboardPalette[$accent].gradientFrom},
      rgba(255, 255, 255, 0)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`;

const Eyebrow = styled.span<{ $accent: AccentKey }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 999px;
  background: ${({ $accent }) => dashboardPalette[$accent].surface};
  color: ${({ $accent }) => dashboardPalette[$accent].text};
`;

const Title = styled.h3`
  margin: 14px 0 10px;
  font-family: ${fontStack.title};
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
`;

const Body = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #334155;
`;

const Footer = styled.footer`
  margin-top: 18px;
  font-size: 0.8rem;
  color: #64748b;
`;

const IconWrap = styled.div<{ $accent: AccentKey }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $accent }) => dashboardPalette[$accent].surface};
  color: ${({ $accent }) => dashboardPalette[$accent].text};
`;

export const InsightHighlight: React.FC<InsightHighlightProps> = ({
  title,
  body,
  eyebrow,
  accent = 'emerald',
  icon,
  footer,
}) => (
  <Card $accent={accent}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      {eyebrow && <Eyebrow $accent={accent}>{eyebrow}</Eyebrow>}
      {icon && <IconWrap $accent={accent}>{icon}</IconWrap>}
    </div>
    <Title>{title}</Title>
    <Body>{body}</Body>
    {footer && <Footer>{footer}</Footer>}
  </Card>
);
