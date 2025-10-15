"use client";

import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface GenerationProgressProps {
  progress: number;
  currentPhase: string;
}

export function GenerationProgress({
  progress,
  currentPhase,
}: GenerationProgressProps) {
  const phases = [
    { name: "Extracting brief", complete: progress > 20 },
    { name: "Drafting questions", complete: progress > 40 },
    { name: "Structuring config", complete: progress > 60 },
    { name: "Validating", complete: progress > 80 },
    { name: "Finalizing", complete: progress >= 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{currentPhase}</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Phase List */}
      <div className="space-y-3">
        {phases.map((phase, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`
                flex h-6 w-6 items-center justify-center rounded-full transition-colors
                ${
                  phase.complete
                    ? "bg-primary text-primary-foreground"
                    : progress > index * 20
                    ? "border-2 border-primary"
                    : "border-2 border-gray-300 dark:border-gray-700"
                }
              `}
            >
              {phase.complete ? (
                <span className="text-xs">✓</span>
              ) : progress > index * 20 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-xs text-gray-400">{index + 1}</span>
              )}
            </div>
            <span
              className={`text-sm ${
                phase.complete || progress > index * 20
                  ? "text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-500 dark:text-gray-500"
              }`}
            >
              {phase.name}
            </span>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Tip:</strong> Generation typically takes 20-30 seconds. We're using Claude
          to analyze your documents and generate a structured survey that matches your
          methodology.
        </p>
      </Card>
    </div>
  );
}
