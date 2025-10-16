import React from 'react';
import styled from 'styled-components';
import type { DashboardConfig, DashboardWidget, DashboardTextWidget } from '@nesolagus/config';
import { useDashboardData } from './useDashboardData';
import { firstBinding, resolveMetricValue, resolveChartDistribution, resolveTableRows } from './helpers';
import type { DashboardSummary, QuestionStatRow } from './types';
import {
  KpiStatCard,
  FunnelChart,
  SegmentDonut,
  InsightHighlight,
  dashboardPalette,
} from '@nesolagus/dashboard-widgets';
import type { AccentKey } from '@nesolagus/dashboard-widgets';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const WidgetCard = styled.div<{ $accent: AccentKey }>`
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 32px 60px -35px rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.18);
  position: relative;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: ${({ $accent }) =>
      `linear-gradient(135deg, ${dashboardPalette[$accent].gradientFrom}, rgba(255,255,255,0))`};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`;

const WidgetTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const WidgetSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

type VariantKey =
  | 'metric-primary'
  | 'metric-delta'
  | 'chart-funnel'
  | 'chart-donut'
  | 'table-breakdown'
  | 'text-insight'
  | 'unknown';

const getVariant = (widget: DashboardWidget): VariantKey => {
  const key = (widget.notes as VariantKey) ?? 'unknown';
  if (
    key === 'metric-primary' ||
    key === 'metric-delta' ||
    key === 'chart-funnel' ||
    key === 'chart-donut' ||
    key === 'table-breakdown' ||
    key === 'text-insight'
  ) {
    return key;
  }
  switch (widget.type) {
    case 'metric':
      return 'metric-primary';
    case 'chart':
      return 'chart-funnel';
    case 'table':
      return 'table-breakdown';
    case 'text':
      return 'text-insight';
    default:
      return 'unknown';
  }
};

const getAccent = (widget: DashboardWidget): AccentKey => {
  if (widget.accent && ['emerald', 'cyan', 'violet', 'amber', 'neutral'].includes(widget.accent)) {
    return widget.accent as AccentKey;
  }
  return 'emerald';
};

const renderWidget = (
  widget: DashboardWidget,
  summary: DashboardSummary | null,
  questionStats: QuestionStatRow[]
) => {
  const accent = getAccent(widget);
  const binding = firstBinding(widget);
  const variant = getVariant(widget);

  switch (variant) {
    case 'metric-primary':
    case 'metric-delta': {
      if (!binding) return <EmptyState>No metric binding configured</EmptyState>;
      const rawValue = resolveMetricValue(binding, summary);
      if (rawValue === null || rawValue === undefined) {
        return <EmptyState>No data yet</EmptyState>;
      }
      const format = widget.presentation?.metric?.format ?? 'number';
      let displayValue = rawValue as number;
      if (format === 'percentage') {
        displayValue = Math.round(displayValue * 10) / 10;
      } else if (format === 'currency') {
        displayValue = Math.round(displayValue);
      }

      const formatted =
        format === 'percentage'
          ? `${displayValue}%`
          : format === 'currency'
          ? `$${displayValue.toLocaleString('en-US')}`
          : displayValue.toLocaleString('en-US');

      const deltaValue = widget.presentation?.metric?.comparison?.baseline?.value;
      return (
        <KpiStatCard
          title={widget.title}
          subtitle={widget.subtitle || binding.label || undefined}
          value={formatted}
          accent={accent}
          footnote={widget.description || undefined}
          delta={
            variant === 'metric-delta' && deltaValue
              ? {
                  value: String(deltaValue),
                  direction: 'neutral',
                  tone: 'neutral',
                }
              : undefined
          }
        />
      );
    }
    case 'chart-funnel': {
      const funnelData = buildFunnelData(summary);
      if (funnelData.every((entry) => entry.value === 0)) {
        return <EmptyState>No responses captured yet</EmptyState>;
      }
      return <FunnelChart data={funnelData} accent={accent} valueFormat={(v: number) => `${v}%`} />;
    }
    case 'chart-donut': {
      if (!binding) return <EmptyState>No data configured</EmptyState>;
      const distribution = resolveChartDistribution(binding, questionStats, binding.aggregation);
      if (distribution.length === 0) return <EmptyState>No responses captured yet</EmptyState>;
      return (
        <SegmentDonut
          data={distribution.map((row) => ({ label: row.label, value: Math.round(row.value) }))}
          accent={accent}
          totalLabel="Responses"
          formatValue={(v: number) => `${v}%`}
        />
      );
    }
    case 'table-breakdown': {
      if (!binding) return <EmptyState>No data configured</EmptyState>;
      const rows = resolveTableRows(binding, questionStats, binding.aggregation);
      if (rows.length === 0) return <EmptyState>No responses captured yet</EmptyState>;
      return (
        <SegmentDonut
          data={rows.map((row) => ({ label: row.label, value: Math.round(row.percentage) }))}
          accent={accent}
          totalLabel="Total"
          formatValue={(v: number) => `${v}%`}
        />
      );
    }
    case 'text-insight': {
      const textWidget = widget as DashboardTextWidget;
      return (
        <InsightHighlight
          title={textWidget.title}
          body={
            textWidget.content ||
            'Survey respondents highlight community art access and collaborations as key engagement drivers.'
          }
          eyebrow={textWidget.subtitle || 'Key Insight'}
          accent={accent}
          footer={textWidget.description || undefined}
        />
      );
    }
    default:
      return <EmptyState>Widget type not supported yet.</EmptyState>;
  }
};

const buildFunnelData = (summary: DashboardSummary | null) => {
  if (!summary) {
    return [
      { label: 'Started', value: 0, hint: 'Total responses' },
      { label: 'Completed', value: 0, hint: 'Finished survey' },
      { label: 'Opt-in', value: 0, hint: 'Consent to share' },
    ];
  }
  const completionRate = summary.totalResponses
    ? Math.round((summary.completedResponses / summary.totalResponses) * 100)
    : 0;
  const optInRate = Math.round((summary.demographicsOptInRate ?? 0) * 100);
  return [
    { label: 'Started', value: 100, hint: `${summary.totalResponses.toLocaleString()} responses` },
    { label: 'Completed', value: completionRate, hint: `${summary.completedResponses.toLocaleString()} completed` },
    { label: 'Opt-in', value: optInRate, hint: `${Math.round(optInRate)}% consent` },
  ];
};

type Props = {
  config: DashboardConfig;
};

export const DashboardRenderer: React.FC<Props> = ({ config }) => {
  const { summary, questionStats, isLoading, error } = useDashboardData(config);

  if (isLoading) {
    return <EmptyState>Loading dashboard…</EmptyState>;
  }

  if (error) {
    return <EmptyState>{error}</EmptyState>;
  }

  if (!config.widgets || config.widgets.length === 0) {
    return <EmptyState>No widgets configured yet.</EmptyState>;
  }

  return (
    <DashboardContainer>
      {config.widgets.map((widget) => {
        const accent = getAccent(widget);
        const variant = getVariant(widget);
        const showHeading = ![
          'metric-primary',
          'metric-delta',
          'text-insight',
        ].includes(variant);

        return (
          <WidgetCard key={widget.id} role="region" aria-label={widget.title} $accent={accent}>
            {showHeading && (
              <div style={{ marginBottom: '12px' }}>
                <WidgetTitle>{widget.title}</WidgetTitle>
                {widget.subtitle && <WidgetSubtitle>{widget.subtitle}</WidgetSubtitle>}
              </div>
            )}
            {renderWidget(widget, summary, questionStats)}
          </WidgetCard>
        );
      })}
    </DashboardContainer>
  );
};
