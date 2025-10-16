"use client";

import { useState, useEffect } from "react";
import { DashboardEditor } from "@/components/dashboard/DashboardEditor";
import { createEmptyDashboardConfig, type DashboardConfig } from "@nesolagus/config";
import { Loader2 } from "lucide-react";

export default function FullScreenDashboardPage({ params }: { params: { id: string } }) {
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [surveyConfig, setSurveyConfig] = useState<any>(null);
  const [draftName, setDraftName] = useState<string>("Dashboard Builder");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/drafts/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to load draft");
        }
        const draft = await response.json();
        setDraftName(draft.client?.name || "Dashboard Builder");
        setSurveyConfig(draft.config);
        if (draft.dashboardConfig) {
          setDashboardConfig(draft.dashboardConfig as DashboardConfig);
        } else {
          setDashboardConfig(
            createEmptyDashboardConfig({
              title: draft.config?.survey?.name
                ? `${draft.config.survey.name} Dashboard`
                : "New Dashboard",
            })
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load draft");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [params.id]);

  const handleDashboardChange = async (config: DashboardConfig) => {
    setDashboardConfig(config);
    setIsSaving(true);
    try {
      await fetch(`/api/drafts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboardConfig: config }),
      });
    } catch (err) {
      console.error("Failed to save dashboardConfig:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          Loading dashboard builder...
        </div>
      </div>
    );
  }

  if (error || !dashboardConfig) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center">
        <p className="text-red-600">{error || "Dashboard configuration unavailable."}</p>
        <button
          onClick={() => window.close()}
          className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
        >
          Close Window
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{draftName}</h1>
          <p className="text-sm text-gray-500">Dashboard Builder (Full Screen)</p>
        </div>
        <button
          onClick={() => window.close()}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Close
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
      <DashboardEditor
        config={dashboardConfig}
        onChange={handleDashboardChange}
        isSaving={isSaving}
        draftId={params.id}
        surveyConfig={surveyConfig}
      />
      </main>
    </div>
  );
}
