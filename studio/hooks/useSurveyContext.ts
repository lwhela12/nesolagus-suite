"use client";

import { useMemo } from "react";
import type { QuestionDefinition, SupportedQuestionType, PreviewPayload } from "@/lib/dashboardPreview";

export type QuestionOption = {
  id: string;
  label: string;
  type: SupportedQuestionType;
  options: string[];
};

export type SurveySummaryMetric =
  | "total_responses"
  | "completed_responses"
  | "completion_rate"
  | "avg_completion_time"
  | "avg_donation"
  | "opt_in_rate";

export type InsightFormat = "percentage" | "number" | "currency";

export type InsightOption = {
  id: string;
  label: string;
  description: string;
  metricValue: number;
  metricFormat: InsightFormat;
  metricLabel?: string;
  questionId?: string;
  optionLabel?: string;
};

export interface SurveyContextCatalog {
  questions: QuestionOption[];
  metrics: Array<{ id: SurveySummaryMetric; label: string; description: string }>;
  insights: InsightOption[];
}

const SUPPORTED_TYPES: SupportedQuestionType[] = [
  "single-choice",
  "multi-choice",
  "yes-no",
  "scale",
];

function buildQuestionOptions(questions: QuestionDefinition[] | undefined | null): QuestionOption[] {
  if (!Array.isArray(questions)) return [];
  return questions
    .filter((definition) => SUPPORTED_TYPES.includes(definition.type))
    .map((definition) => ({
      id: definition.id,
      label: definition.text,
      type: definition.type,
      options: definition.options ?? [],
    }));
}

function buildMetricOptions(): SurveyContextCatalog["metrics"] {
  return [
    {
      id: "total_responses",
      label: "Total responses",
      description: "Total participants who started the survey.",
    },
    {
      id: "completed_responses",
      label: "Completed responses",
      description: "Participants who reached the end of the survey.",
    },
    {
      id: "completion_rate",
      label: "Completion rate",
      description: "Percentage of participants that completed the survey.",
    },
    {
      id: "avg_completion_time",
      label: "Avg completion time",
      description: "Average time for a participant to finish.",
    },
    {
      id: "opt_in_rate",
      label: "Opt-in rate",
      description: "Percentage opting into follow-up conversations.",
    },
    {
      id: "avg_donation",
      label: "Avg donation amount",
      description: "Average donation from respondents able to donate.",
    },
  ];
}

function buildInsightOptions(preview: PreviewPayload | null | undefined): InsightOption[] {
  if (!preview) return [];
  const insights: InsightOption[] = [];

  const summary = preview.summary;
  if (summary) {
    const completionRate = summary.totalResponses > 0
      ? (summary.completedResponses / summary.totalResponses) * 100
      : 0;
    insights.push({
      id: "insight-completion",
      label: "High completion momentum",
      description: `Completion rate at ${Math.round(completionRate)}% with ${summary.completedResponses.toLocaleString("en-US")} completions.`,
      metricValue: completionRate,
      metricFormat: "percentage",
      metricLabel: "Completion rate",
    });
    insights.push({
      id: "insight-opt-in",
      label: "Follow-up interest",
      description: `${Math.round(summary.demographicsOptInRate * 100)}% opted into follow-up (${summary.demographicsOptInCount.toLocaleString("en-US")} people).`,
      metricValue: summary.demographicsOptInRate * 100,
      metricFormat: "percentage",
      metricLabel: "Opt-in rate",
    });
    insights.push({
      id: "insight-donation",
      label: "Average donation",
      description: `Respondents who donated gave an average of $${summary.avgDonation.toLocaleString("en-US")}.`,
      metricValue: summary.avgDonation,
      metricFormat: "currency",
      metricLabel: "Average donation",
    });
  }

  if (Array.isArray(preview.questionStats)) {
    preview.questionStats.forEach((stat) => {
      const entries = Object.entries(stat.answerDistribution ?? {});
      if (entries.length === 0) return;
      const [topLabel, topEntry] = entries.reduce(
        (best, candidate) => (candidate[1].percentage > best[1].percentage ? candidate : best),
        entries[0]
      );
      insights.push({
        id: `insight-top-${stat.questionId}`,
        label: `Top response • ${stat.questionText}`,
        description: `${topLabel} accounts for ${topEntry.percentage.toFixed(1)}% of responses.`,
        metricValue: topEntry.percentage,
        metricFormat: "percentage",
        metricLabel: "Top option share",
        questionId: stat.questionId,
        optionLabel: topLabel,
      });
    });
  }

  return insights;
}

export function useSurveyContext(
  questions: QuestionDefinition[] | undefined | null,
  preview: PreviewPayload | null | undefined
): SurveyContextCatalog {
  return useMemo(() => {
    return {
      questions: buildQuestionOptions(questions),
      metrics: buildMetricOptions(),
      insights: buildInsightOptions(preview),
    };
  }, [questions, preview]);
}
