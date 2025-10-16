import { useEffect, useState, useCallback } from "react";
import type { PreviewPayload } from "@/lib/dashboardPreview";

type PreviewState = {
  data: PreviewPayload | null;
  isLoading: boolean;
  error: string | null;
};

export function useDashboardPreview(draftId?: string) {
  const [state, setState] = useState<PreviewState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchPreview = useCallback(async () => {
    if (!draftId) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`/api/drafts/${draftId}/preview-data`);
      if (!response.ok) {
        throw new Error("Failed to load preview data");
      }
      const body = await response.json();
      setState({
        data: body.dashboardPreview ?? null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load preview data",
      });
    }
  }, [draftId]);

  useEffect(() => {
    if (!draftId) return;
    fetchPreview();
  }, [draftId, fetchPreview]);

  const seedPreview = useCallback(async () => {
    if (!draftId) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`/api/drafts/${draftId}/preview-data/seed`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to generate preview data");
      }
      const body = await response.json();
      setState({
        data: body.dashboardPreview ?? null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to generate preview data",
      });
    }
  }, [draftId]);

  const clearPreview = useCallback(async () => {
    if (!draftId) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await fetch(`/api/drafts/${draftId}/preview-data`, { method: "DELETE" });
      setState({ data: null, isLoading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to clear preview data",
      });
    }
  }, [draftId]);

  return {
    preview: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchPreview,
    seedPreview,
    clearPreview,
  };
}
