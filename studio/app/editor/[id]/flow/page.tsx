"use client";

import { useState, useEffect } from "react";
import { FlowEditor } from "@/components/flow/FlowEditor";
import { FlowLayout } from "@/components/flow/types";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FlowEditorSection({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState<any>(null);
  const [flowLayout, setFlowLayout] = useState<FlowLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const response = await fetch(`/api/drafts/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to load draft");
        }
        const draft = await response.json();
        setConfig(draft.config);
        setFlowLayout(draft.flowLayout || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load draft");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [params.id]);

  const handleConfigChange = async (newConfig: any) => {
    setConfig(newConfig);
    setIsSaving(true);
    try {
      await fetch(`/api/drafts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig }),
      });
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFlowLayoutChange = async (newLayout: FlowLayout) => {
    setFlowLayout(newLayout);
    setIsSaving(true);
    try {
      await fetch(`/api/drafts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowLayout: newLayout }),
      });
    } catch (error) {
      console.error("Failed to save flowLayout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading flow editor...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="card-elevated border-destructive/50 max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Error Loading Flow</CardTitle>
            </div>
            <CardDescription>{error || "Draft configuration not found"}</CardDescription>
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
              <CardTitle>Visual Flow Editor</CardTitle>
              <CardDescription>
                Interactive canvas showing your survey structure. Drag blocks to reposition, click to edit.
                {isSaving && <span className="ml-2 text-primary animate-pulse">Saving...</span>}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <FlowEditor
            config={config}
            flowLayout={flowLayout}
            onConfigChange={handleConfigChange}
            onFlowLayoutChange={handleFlowLayoutChange}
            className="w-full h-full"
          />
        </CardContent>
      </Card>
    </div>
  );
}
