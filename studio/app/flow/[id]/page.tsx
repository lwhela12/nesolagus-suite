"use client";

import { useState, useEffect } from "react";
import { FlowEditor } from "@/components/flow/FlowEditor";
import { FlowLayout } from "@/components/flow/types";
import { Loader2 } from "lucide-react";

export default function FullScreenFlowPage({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState<any>(null);
  const [flowLayout, setFlowLayout] = useState<FlowLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Save to API
    try {
      await fetch(`/api/drafts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig }),
      });
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  };

  const handleFlowLayoutChange = async (newLayout: FlowLayout) => {
    setFlowLayout(newLayout);
    // Auto-save flowLayout
    try {
      await fetch(`/api/drafts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowLayout: newLayout }),
      });
    } catch (error) {
      console.error("Failed to save flowLayout:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading flow editor...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Draft not found"}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      <FlowEditor
        config={config}
        flowLayout={flowLayout}
        onConfigChange={handleConfigChange}
        onFlowLayoutChange={handleFlowLayoutChange}
        className="w-full h-screen border-0 bg-gray-50 relative"
      />
    </div>
  );
}
