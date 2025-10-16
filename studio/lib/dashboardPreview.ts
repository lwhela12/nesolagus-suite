import type { DashboardConfig } from "@nesolagus/config";

export type PreviewSummary = {
  totalResponses: number;
  completedResponses: number;
  avgCompletionTime: number;
  demographicsOptInRate: number;
  demographicsOptInCount: number;
  avgDonation: number;
};

export type PreviewDistribution = Record<string, { count: number; percentage: number }>;

export type PreviewQuestionStat = {
  questionId: string;
  questionText: string;
  questionType: string;
  totalResponses: number;
  answerDistribution: PreviewDistribution;
};

export type PreviewPayload = {
  summary: PreviewSummary;
  questionStats: PreviewQuestionStat[];
  generatedAt: string;
};

export type SupportedQuestionType = "single-choice" | "multi-choice" | "yes-no" | "scale" | "text";

export type QuestionDefinition = {
  id: string;
  type: SupportedQuestionType;
  text: string;
  options: string[];
};

export function formatQuestionText(block: any): string {
  if (typeof block?.content === "string") return block.content;
  if (typeof block?.content === "object") {
    return block.content.default || Object.values(block.content)[0] || "Untitled question";
  }
  return block?.text || "Untitled question";
}

export function extractQuestionDefinitions(config: any): QuestionDefinition[] {
  const supportedTypes: SupportedQuestionType[] = ["single-choice", "multi-choice", "yes-no", "scale", "text"];
  const blocks = config?.blocks ?? {};

  return Object.entries<any>(blocks)
    .filter(([, block]) => supportedTypes.includes(block?.type))
    .map(([blockId, block]) => {
      const type = (block?.type as SupportedQuestionType) || "text";
      const options: string[] =
        block?.options?.map((option: any) => option?.label || option?.value || "Option") ??
        (type === "yes-no"
          ? ["Yes", "No"]
          : type === "scale"
          ? ["1", "2", "3", "4", "5"]
          : []);

      return {
        id: blockId,
        type,
        text: formatQuestionText(block),
        options,
      };
    });
}

type SyntheticSummary = PreviewSummary;
type SyntheticQuestionStat = PreviewQuestionStat;

function seededRandom(seed: string) {
  let value = 0;
  for (let i = 0; i < seed.length; i++) {
    value = (value * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
}

function generateSummary(rand: () => number): SyntheticSummary {
  const totalResponses = 180 + Math.floor(rand() * 320);
  const completionRate = 0.65 + rand() * 0.25;
  const completedResponses = Math.round(totalResponses * completionRate);
  const avgCompletionTime = parseFloat((6 + rand() * 4).toFixed(1));
  const demographicsOptInRate = parseFloat((0.45 + rand() * 0.35).toFixed(2));
  const demographicsOptInCount = Math.round(completedResponses * demographicsOptInRate);
  const avgDonation = Math.round(180 + rand() * 420);

  return {
    totalResponses,
    completedResponses,
    avgCompletionTime,
    demographicsOptInRate,
    demographicsOptInCount,
    avgDonation,
  };
}

function generateDistribution(
  rand: () => number,
  labels: string[],
  total: number
): PreviewDistribution {
  const weights = labels.map(() => rand() + 0.2);
  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  const distribution: PreviewDistribution = {};
  labels.forEach((label, idx) => {
    const percentage = (weights[idx] / weightSum) * 100;
    const count = Math.round((percentage / 100) * total);
    distribution[label] = {
      count,
      percentage: parseFloat(percentage.toFixed(1)),
    };
  });

  return distribution;
}

export function generateSyntheticPreview(params: {
  draftId: string;
  config: any;
  dashboardConfig?: DashboardConfig | null;
}): PreviewPayload {
  const rand = seededRandom(params.draftId);
  const summary = generateSummary(rand);

  const questionStats: SyntheticQuestionStat[] = extractQuestionDefinitions(params.config)
    .filter((definition) => definition.type !== "text")
    .slice(0, 6)
    .map((definition) => {
      const distribution = generateDistribution(rand, definition.options.length > 0 ? definition.options : ["Option A", "Option B", "Option C"], summary.totalResponses);
      return {
        questionId: definition.id,
        questionText: definition.text,
        questionType: definition.type,
        totalResponses: summary.totalResponses,
        answerDistribution: distribution,
      };
    });

  return {
    summary,
    questionStats,
    generatedAt: new Date().toISOString(),
  };
}
