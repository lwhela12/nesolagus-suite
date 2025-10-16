import { useEffect, useState } from 'react';
import { clerkAdminApi } from '../../../services/clerkApi';
import type { DashboardState } from './types';
import type { DashboardConfig } from '@nesolagus/config';

export function useDashboardConfig(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    config: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const response = await clerkAdminApi.getDashboardConfig();
        const dashboard: DashboardConfig | undefined = response.data?.dashboard;
        if (!isMounted) return;

        if (!dashboard) {
          setState({
            config: null,
            isLoading: false,
            error: 'Dashboard configuration not found',
          });
          return;
        }

        setState({
          config: dashboard,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        if (!isMounted) return;
        const message = error?.response?.status === 404
          ? 'Dashboard configuration not available yet'
          : 'Failed to load dashboard';
        setState({
          config: null,
          isLoading: false,
          error: message,
        });
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
