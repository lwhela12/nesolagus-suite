"use client";

import { useEffect, useMemo, useState } from 'react';
import { clerkAdminApi } from '../../../services/clerkApi';
import type {
  DashboardSummary,
  QuestionStatRow,
  WidgetWithBindings,
} from './types';
import type { DashboardConfig } from '@nesolagus/config';

type DashboardDataState = {
  summary: DashboardSummary | null;
  questionStats: QuestionStatRow[];
  isLoading: boolean;
  error: string | null;
};

export function useDashboardData(config: DashboardConfig | null): DashboardDataState {
  const [state, setState] = useState<DashboardDataState>({
    summary: null,
    questionStats: [],
    isLoading: true,
    error: null,
  });

  const requiresQuestionStats = useMemo(() => {
    if (!config) return false;
    return config.widgets.some((widget) => {
      const data = widget.data as WidgetWithBindings['data'];
      const bindings = Array.isArray(data) ? data : [data];
      return bindings.some((binding) => binding?.source?.kind === 'question');
    });
  }, [config]);

  useEffect(() => {
    let isMounted = true;
    if (!config) {
      setState({
        summary: null,
        questionStats: [],
        isLoading: false,
        error: 'Dashboard configuration missing',
      });
      return;
    }

    const loadData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const requests: Array<Promise<any>> = [
          clerkAdminApi.getAnalyticsSummary(),
        ];

        if (requiresQuestionStats) {
          requests.push(clerkAdminApi.getQuestionStats());
        }

        const responses = await Promise.all(requests);
        if (!isMounted) return;

        const [summaryResponse, questionStatsResponse] = responses;

        setState({
          summary: summaryResponse.data ?? null,
          questionStats: questionStatsResponse?.data?.questionStats ?? [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) return;
        setState({
          summary: null,
          questionStats: [],
          isLoading: false,
          error: 'Failed to load dashboard data',
        });
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [config, requiresQuestionStats]);

  return state;
}
