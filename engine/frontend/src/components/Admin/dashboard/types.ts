import type { DashboardConfig, DashboardWidget, DashboardDataBinding } from '@nesolagus/config';

export type DashboardState = {
  config: DashboardConfig | null;
  isLoading: boolean;
  error: string | null;
};

export type DashboardSummary = {
  totalResponses: number;
  completedResponses: number;
  avgCompletionTime: number;
  demographicsOptInCount: number;
  demographicsOptInRate: number;
  avgDonation: number;
};

export type QuestionStatRow = {
  questionId: string;
  questionText: string;
  questionType: string;
  totalResponses: number;
  answerDistribution: Record<
    string,
    {
      count: number;
      percentage: number;
    }
  >;
  semanticSummary?: Record<string, number>;
};

export type QuestionStatsResponse = {
  questionStats: QuestionStatRow[];
};

export type MetricResolverContext = {
  summary: DashboardSummary | null;
  questionStats: QuestionStatRow[];
};

export type WidgetBinding = DashboardDataBinding | DashboardDataBinding[];

export type WidgetWithBindings = DashboardWidget & {
  data: WidgetBinding;
};
