import type {
  DashboardWidget,
  DashboardDataBinding,
  DashboardAggregation,
} from '@nesolagus/config';
import type { DashboardSummary, QuestionStatRow } from './types';

type MetricResolver = (summary: DashboardSummary | null) => number | null;

const metricResolvers: Record<string, MetricResolver> = {
  total_responses: (summary) => summary?.totalResponses ?? null,
  completed_responses: (summary) => summary?.completedResponses ?? null,
  completion_rate: (summary) => {
    if (!summary || summary.totalResponses === 0) return null;
    return (summary.completedResponses / summary.totalResponses) * 100;
  },
  avg_completion_time: (summary) => summary?.avgCompletionTime ?? null,
  demographics_opt_in_rate: (summary) =>
    summary ? summary.demographicsOptInRate * 100 : null,
  avg_donation: (summary) => summary?.avgDonation ?? null,
};

export function resolveMetricValue(binding: DashboardDataBinding, summary: DashboardSummary | null) {
  if (!binding?.source) return null;
  const key = binding.source.value;
  const resolver = typeof key === 'string' ? metricResolvers[key] : undefined;
  if (resolver) {
    return resolver(summary);
  }
  return null;
}

export function resolveChartDistribution(
  binding: DashboardDataBinding,
  questionStats: QuestionStatRow[],
  aggregation: DashboardAggregation | undefined
) {
  if (!binding?.source || binding.source.kind !== 'question') return [];
  const question = questionStats.find((stat) => stat.questionId === binding.source.value);
  if (!question) return [];

  if (aggregation === 'distribution' || !aggregation) {
    return Object.entries(question.answerDistribution).map(([label, value]) => ({
      label,
      value: value.percentage,
      count: value.count,
    }));
  }

  return [];
}

export function resolveTableRows(
  binding: DashboardDataBinding,
  questionStats: QuestionStatRow[],
  aggregation: DashboardAggregation | undefined
) {
  const distribution = resolveChartDistribution(binding, questionStats, aggregation);
  return distribution.map((item) => ({
    label: item.label,
    value: item.count,
    percentage: item.value,
  }));
}

export function firstBinding(widget: DashboardWidget): DashboardDataBinding | null {
  if (!widget.data) return null;
  return Array.isArray(widget.data) ? widget.data[0] ?? null : widget.data;
}
