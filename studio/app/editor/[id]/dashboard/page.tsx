"use client";

import { useState, useEffect } from "react";
import { DashboardEditor } from "@/components/dashboard/DashboardEditor";
import { createEmptyDashboardConfig, type DashboardConfig } from "@nesolagus/config";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardSection({ params }: { params: { id: string } }) {
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [surveyConfig, setSurveyConfig] = useState<any>(null);
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

  const handleOpenFullScreen = () => {
    window.open(`/dashboard/${params.id}`, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard builder...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardConfig) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="card-elevated border-destructive/50 max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            </div>
            <CardDescription>{error || "Dashboard configuration not found"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <Card className="card-elevated h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>Dashboard Builder</CardTitle>
              <CardDescription>
                Configure analytics widgets that summarize survey performance for this client.
                {isSaving && <span className="ml-2 text-primary animate-pulse">Saving...</span>}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <DashboardEditor
            config={dashboardConfig}
            onChange={handleDashboardChange}
            isSaving={isSaving}
            draftId={params.id}
            surveyConfig={surveyConfig}
            onOpenFullScreen={handleOpenFullScreen}
          />
        </CardContent>
      </Card>
    </div>
  );
}
