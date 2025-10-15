"use client";

import { useState, useEffect } from "react";
import { PreviewRenderer } from "./PreviewRenderer";
import { DeviceToggle, DeviceSize } from "./DeviceToggle";
import { TestModePanel } from "./TestModePanel";
import { InlineThemeEditor } from "./InlineThemeEditor";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SurveyPreviewProps {
  config: any;
  draftId: string;
  surveyName: string;
  clientSlug?: string; // Optional client slug to load theme
}

interface Response {
  questionId: string;
  answer: any;
  timestamp: number;
}

export function SurveyPreview({ config, draftId, surveyName, clientSlug }: SurveyPreviewProps) {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");
  const [responses, setResponses] = useState<Response[]>([]);
  const [progress, setProgress] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [customTheme, setCustomTheme] = useState<any>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  // Load client theme if clientSlug is provided
  useEffect(() => {
    if (clientSlug) {
      loadClientTheme();
    }
  }, [clientSlug]);

  const loadClientTheme = async () => {
    if (!clientSlug) return;

    setIsLoadingTheme(true);
    try {
      const response = await fetch(`/api/clients/${clientSlug}/theme`);
      if (response.ok) {
        const data = await response.json();
        if (data.theme) {
          setCustomTheme(data.theme);
        }
      }
    } catch (error) {
      console.error("Failed to load client theme:", error);
    } finally {
      setIsLoadingTheme(false);
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setResponses((prev) => [
      ...prev,
      {
        questionId,
        answer,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleReset = () => {
    setResponses([]);
    setProgress(0);
    setResetKey((prev) => prev + 1);
  };

  const getDeviceWidth = () => {
    switch (deviceSize) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  return (
    <div className="h-screen flex flex-col relative">
      {/* Inline Theme Editor */}
      {clientSlug && (
        <InlineThemeEditor
          clientSlug={clientSlug}
          initialTheme={customTheme}
          onThemeChange={(newTheme) => {
            setCustomTheme(newTheme);
          }}
        />
      )}

      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/generate?draft=${draftId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{surveyName}</h1>
              <p className="text-sm text-gray-500">Survey Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DeviceToggle currentDevice={deviceSize} onDeviceChange={setDeviceSize} />
            <Link href={`/generate?draft=${draftId}`}>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-100">
          <div
            className="h-full bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: getDeviceWidth(),
              maxWidth: "100%",
            }}
          >
            <PreviewRenderer
              key={resetKey}
              config={config}
              onAnswer={handleAnswer}
              onProgress={setProgress}
              customTheme={customTheme}
            />
          </div>
        </div>

        {/* Test Panel */}
        <div className="w-96 border-l bg-white">
          <TestModePanel
            responses={responses}
            progress={progress}
            onReset={handleReset}
            config={config}
          />
        </div>
      </div>
    </div>
  );
}
