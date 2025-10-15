"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GenerationForm } from "@/components/generation/GenerationForm";
import { GenerationProgress } from "@/components/generation/GenerationProgress";
import { GeneratedSurveyView } from "@/components/generation/GeneratedSurveyView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type GenerationStep = "form" | "generating" | "complete" | "error" | "loading";

interface GenerationState {
  step: GenerationStep;
  draftId?: string;
  progress: number;
  currentPhase?: string;
  config?: any;
  error?: string;
}

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get("draft");

  const [state, setState] = useState<GenerationState>({
    step: draftIdParam ? "loading" : "form",
    progress: 0,
  });

  // Load draft from URL parameter on mount
  useEffect(() => {
    if (draftIdParam) {
      loadDraft(draftIdParam);
    }
  }, [draftIdParam]);

  const loadDraft = async (draftId: string) => {
    try {
      const response = await fetch(`/api/drafts/${draftId}`);
      if (!response.ok) throw new Error("Failed to load draft");

      const draft = await response.json();

      setState({
        step: "complete",
        progress: 100,
        draftId: draft.id,
        config: draft.config,
      });
    } catch (error) {
      setState({
        step: "error",
        progress: 0,
        error: "Failed to load draft. It may have been deleted.",
      });
    }
  };

  const handleGenerate = async (formData: any) => {
    setState({ step: "generating", progress: 10, currentPhase: "Extracting brief..." });

    try {
      // Call API to generate survey
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const result = await response.json();

      // Poll for completion
      await pollForCompletion(result.draftId);
    } catch (error) {
      setState({
        step: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const pollForCompletion = async (draftId: string) => {
    const maxAttempts = 60; // 1 minute max
    let attempts = 0;

    const poll = async () => {
      attempts++;

      const response = await fetch(`/api/drafts/${draftId}`);
      const draft = await response.json();

      if (draft.status === "GENERATED" || draft.status === "READY") {
        setState({
          step: "complete",
          progress: 100,
          draftId: draft.id,
          config: draft.config,
        });
      } else if (draft.status === "VALIDATION_FAILED" || draft.status === "ERROR") {
        setState({
          step: "error",
          progress: 0,
          error: "Generation failed. Please try again.",
        });
      } else if (attempts < maxAttempts) {
        // Update progress based on status
        let progress = 30;
        let phase = "Generating...";

        if (draft.status === "GENERATING") {
          progress = 50;
          phase = "Drafting questions...";
        }

        setState((prev) => ({
          ...prev,
          progress,
          currentPhase: phase,
        }));

        setTimeout(poll, 1000);
      } else {
        setState({
          step: "error",
          progress: 0,
          error: "Generation timed out. Please try again.",
        });
      }
    };

    await poll();
  };

  const handleReset = () => {
    setState({ step: "form", progress: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Generate Survey
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Upload discovery and methodology documents to generate an AI-powered survey
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {state.step === "loading" && (
            <Card>
              <CardHeader>
                <CardTitle>Loading Survey...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              </CardContent>
            </Card>
          )}

          {state.step === "form" && (
            <Card>
              <CardHeader>
                <CardTitle>Survey Generation</CardTitle>
                <CardDescription>
                  Provide your discovery and methodology documents, and we'll generate a
                  structured survey configuration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerationForm onGenerate={handleGenerate} />
              </CardContent>
            </Card>
          )}

          {state.step === "generating" && (
            <Card>
              <CardHeader>
                <CardTitle>Generating Survey...</CardTitle>
                <CardDescription>
                  This typically takes 20-30 seconds. Please don't close this page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerationProgress
                  progress={state.progress}
                  currentPhase={state.currentPhase || "Starting..."}
                />
              </CardContent>
            </Card>
          )}

          {state.step === "complete" && state.config && (
            <div>
              <GeneratedSurveyView
                config={state.config}
                draftId={state.draftId!}
                onReset={handleReset}
              />
            </div>
          )}

          {state.step === "error" && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Generation Failed
                </CardTitle>
                <CardDescription>{state.error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleReset}>Try Again</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
