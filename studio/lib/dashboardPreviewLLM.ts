"use server";

import { z } from "zod";
import type { DashboardConfig } from "@nesolagus/config";
import {
  extractQuestionDefinitions,
  generateSyntheticPreview,
  type PreviewPayload,
  type PreviewQuestionStat,
  type PreviewSummary,
  type QuestionDefinition,
} from "./dashboardPreview";

type RawAnswerValue = string | number | boolean | Array<string | number | boolean>;

export type LLMGeneratedAnswer = {
  questionId: string;
  value: RawAnswerValue;
};

export type LLMGeneratedResponse = {
  respondentId: string;
  persona?: string;
  completionSeconds?: number;
  optedIntoFollowup?: boolean;
  donationAmount?: number | null;
  answers: LLMGeneratedAnswer[];
};

export type GeneratedPreviewResult = {
  preview: PreviewPayload;
  responses: LLMGeneratedResponse[];
  source: "llm" | "synthetic";
  warnings: string[];
};

const AnswerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number(), z.boolean()])),
  ]),
});

const ResponseSchema = z.object({
  respondentId: z.string().min(1),
  persona: z.string().optional(),
  completionSeconds: z.number().positive().max(3600 * 12).optional(),
  optedIntoFollowup: z.boolean().optional(),
  donationAmount: z.union([z.number().min(0), z.null()]).optional(),
  answers: z.array(AnswerSchema).min(1),
});

const ResponseBatchSchema = z.object({
  seedModel: z.string().optional(),
  responses: z.array(ResponseSchema).min(1),
});

type ResponseBatch = z.infer<typeof ResponseBatchSchema>;

const DEFAULT_BATCH_SIZE = 20;
const MAX_TOTAL_RESPONSES = 200;
const SYSTEM_PROMPT = [
  "You generate realistic, clean JSON datasets of survey responses.",
  "Follow the provided schema exactly. Respect question types and available options.",
  "Return concise, professional, policy-compliant answers with no PII.",
].join(" ");

const RESPONSE_SCHEMA_PROMPT = `{
  "seedModel": "string (optional, name of the model you simulated)",
  "responses": [
    {
      "respondentId": "string (cuid or unique slug)",
      "persona": "string (optional label for the persona or segment)",
      "completionSeconds": 420,
      "optedIntoFollowup": true,
      "donationAmount": 125,
      "answers": [
        {
          "questionId": "block-id",
          "value": "single choice label | numeric scale value | array for multi choice"
        }
      ]
    }
  ]
}`;

function hasRealLLM(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.LLM_VENDOR === "anthropic");
}

function normaliseOptionLabel(value: string): string {
  return value.trim();
}

function matchOptionAgainstDefinition(definition: QuestionDefinition, value: string): string {
  const target = value.trim().toLowerCase();
  const options = definition.options ?? [];
  for (const option of options) {
    if (option.trim().toLowerCase() === target) {
      return option;
    }
  }
  if (definition.type === "yes-no") {
    if (["yes", "y", "true"].includes(target)) return "Yes";
    if (["no", "n", "false"].includes(target)) return "No";
  }
  if (definition.type === "scale") {
    const numeric = Number.parseFloat(value);
    if (!Number.isNaN(numeric)) {
      const stringValue = numeric.toString();
      const match = options.find((option) => option === stringValue);
      if (match) return match;
    }
  }
  return normaliseOptionLabel(value);
}

function answerValuesForDistribution(
  definition: QuestionDefinition,
  rawValue: RawAnswerValue
): string[] {
  const coerce = (value: string | number | boolean): string => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return value;
  };

  if (Array.isArray(rawValue)) {
    const values = rawValue.map(coerce).filter((item) => item !== "");
    return values.map((value) => matchOptionAgainstDefinition(definition, value));
  }

  const single = coerce(rawValue as any);
  return [matchOptionAgainstDefinition(definition, single)];
}

function aggregateQuestion(
  definition: QuestionDefinition,
  responses: LLMGeneratedResponse[]
): PreviewQuestionStat | null {
  if (definition.type === "text") {
    return null;
  }

  const counts = new Map<string, number>();
  let answeredCount = 0;

  responses.forEach((response) => {
    const answer = response.answers.find((item) => item.questionId === definition.id);
    if (!answer) return;
    answeredCount += 1;
    const values = answerValuesForDistribution(definition, answer.value);
    const uniqueValues = Array.from(new Set(values));
    uniqueValues.forEach((value) => {
      const current = counts.get(value) ?? 0;
      counts.set(value, current + 1);
    });
  });

  if (answeredCount === 0) {
    return {
      questionId: definition.id,
      questionText: definition.text,
      questionType: definition.type,
      totalResponses: responses.length,
      answerDistribution: {},
    };
  }

  const labels = new Set<string>();
  definition.options.forEach((option) => labels.add(option));
  counts.forEach((_count, key) => labels.add(key));

  const answerDistribution: Record<string, { count: number; percentage: number }> = {};
  labels.forEach((label) => {
    const count = counts.get(label) ?? 0;
    const percentage = parseFloat(((count / answeredCount) * 100).toFixed(1));
    answerDistribution[label] = { count, percentage };
  });

  return {
    questionId: definition.id,
    questionText: definition.text,
    questionType: definition.type,
    totalResponses: answeredCount,
    answerDistribution,
  };
}

function aggregateSummary(
  draftId: string,
  responses: LLMGeneratedResponse[]
): PreviewSummary {
  const totalResponses = responses.length;
  const completedResponses = responses.filter((response) => response.answers.length > 0).length;

  const completionSeconds = responses
    .map((response) => response.completionSeconds)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const avgCompletionTime =
    completionSeconds.length > 0
      ? parseFloat((completionSeconds.reduce((sum, value) => sum + value, 0) / completionSeconds.length / 60).toFixed(1))
      : 7.2;

  const optedInCount = responses.filter((response) => response.optedIntoFollowup).length;
  const demographicsOptInRate =
    totalResponses > 0 ? parseFloat((optedInCount / totalResponses).toFixed(2)) : 0;

  const donationValues = responses
    .map((response) => response.donationAmount)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const avgDonation =
    donationValues.length > 0
      ? Math.round(
          donationValues.reduce((sum, value) => sum + value, 0) / donationValues.length
        )
      : fallbackDonationEstimate(draftId);

  return {
    totalResponses,
    completedResponses,
    avgCompletionTime,
    demographicsOptInRate,
    demographicsOptInCount: optedInCount,
    avgDonation,
  };
}

function fallbackDonationEstimate(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return 220 + (hash % 160);
}

function aggregatePreview(
  draftId: string,
  questions: QuestionDefinition[],
  responses: LLMGeneratedResponse[]
): PreviewPayload {
  const questionStats = questions
    .map((question) => aggregateQuestion(question, responses))
    .filter((value): value is PreviewQuestionStat => value !== null);

  return {
    summary: aggregateSummary(draftId, responses),
    questionStats,
    generatedAt: new Date().toISOString(),
  };
}

function createBatchPrompt(options: {
  surveyTitle?: string;
  description?: string;
  audience?: string;
  scenario?: string;
  personaHint?: string;
  questions: QuestionDefinition[];
  count: number;
}) {
  const lines: string[] = [];
  if (options.surveyTitle) {
    lines.push(`Survey Title: ${options.surveyTitle}`);
  }
  if (options.description) {
    lines.push(`Survey Purpose: ${options.description}`);
  }
  if (options.audience) {
    lines.push(`Audience: ${options.audience}`);
  }
  if (options.scenario) {
    lines.push(`Scenario: ${options.scenario}`);
  }
  if (options.personaHint) {
    lines.push(`Persona Guidance: ${options.personaHint}`);
  }
  lines.push("");
  lines.push("Question Catalogue:");
  options.questions.forEach((question, index) => {
    const header = `${index + 1}. [${question.type}] ${question.text} (id: ${question.id})`;
    const extras =
      question.options.length > 0
        ? `Options: ${question.options.join(" | ")}`
        : "Free response";
    lines.push(`${header}\n   ${extras}`);
  });
  lines.push("");
  lines.push(
    [
      `Generate ${options.count} realistic, diverse survey responses.`,
      "Reflect the same question order and include answers for each one.",
      "Respondents may occasionally skip non-required questions.",
      "Include optional metadata fields when they make sense.",
      "Return strict JSON matching the schema:",
      RESPONSE_SCHEMA_PROMPT,
    ].join("\n")
  );
  lines.push("");
  lines.push(
    [
      "Important formatting rules:",
      "- Use answer.option labels exactly as provided when selecting choices.",
      "- Multi-choice answers should be arrays of selected labels.",
      "- Scale questions should return numbers inside the provided scale.",
      "- Yes/No questions should use `true`/`false` or the provided labels.",
      "- donationAmount can be null if not applicable.",
      "- Keep answers free of PII or offensive content.",
    ].join("\n")
  );

  return lines.join("\n");
}

async function requestBatchFromLLM(prompt: string): Promise<ResponseBatch> {
  const { getLLM } = await import("@/src/llm");
  const llm = getLLM();
  const raw = await llm.complete({
    system: SYSTEM_PROMPT,
    user: prompt,
    json: true,
    maxTokens: 4000,
    temperature: 0.5,
  });
  return ResponseBatchSchema.parse(raw);
}

function clampCount(count: number | undefined): number {
  if (!count || Number.isNaN(count)) return 50;
  return Math.max(5, Math.min(MAX_TOTAL_RESPONSES, Math.round(count)));
}

export async function generateDashboardPreviewWithLLM(params: {
  draftId: string;
  config: any;
  dashboardConfig?: DashboardConfig | null;
  requestedCount?: number;
  personaHint?: string;
  scenario?: string;
  surveyTitle?: string;
  audience?: string;
}): Promise<GeneratedPreviewResult> {
  const requestedCount = clampCount(params.requestedCount);
  const warnings: string[] = [];

  if (!hasRealLLM()) {
    warnings.push("LLM seeding unavailable: no API key configured.");
    return {
      preview: generateSyntheticPreview({
        draftId: params.draftId,
        config: params.config,
        dashboardConfig: params.dashboardConfig,
      }),
      responses: [],
      source: "synthetic",
      warnings,
    };
  }

  const questions = extractQuestionDefinitions(params.config).filter(
    (definition) => definition.type !== "text"
  );

  if (questions.length === 0) {
    warnings.push("No structured questions available for LLM seeding.");
    return {
      preview: generateSyntheticPreview({
        draftId: params.draftId,
        config: params.config,
        dashboardConfig: params.dashboardConfig,
      }),
      responses: [],
      source: "synthetic",
      warnings,
    };
  }

  const responses: LLMGeneratedResponse[] = [];
  const batchSize = Math.min(DEFAULT_BATCH_SIZE, requestedCount);
  let attempts = 0;
  const surveyTitle =
    params.surveyTitle ??
    params.dashboardConfig?.metadata?.title ??
    params.config?.meta?.title;
  const description =
    params.dashboardConfig?.metadata?.description ??
    params.config?.meta?.description;

  while (responses.length < requestedCount && attempts < 4) {
    attempts += 1;
    const remaining = requestedCount - responses.length;
    const prompt = createBatchPrompt({
      surveyTitle,
      description,
      audience: params.audience,
      scenario: params.scenario,
      personaHint: params.personaHint,
      questions,
      count: Math.min(batchSize, remaining),
    });

    try {
      const batch = await requestBatchFromLLM(prompt);
      responses.push(...batch.responses);
    } catch (error) {
      warnings.push(`LLM batch failed: ${error instanceof Error ? error.message : "unknown error"}`);
      if (attempts >= 2) {
        break;
      }
    }
  }

  if (responses.length === 0) {
    warnings.push("Falling back to heuristic preview generation.");
    return {
      preview: generateSyntheticPreview({
        draftId: params.draftId,
        config: params.config,
        dashboardConfig: params.dashboardConfig,
      }),
      responses: [],
      source: "synthetic",
      warnings,
    };
  }

  const preview = aggregatePreview(params.draftId, questions, responses);
  return {
    preview,
    responses,
    source: "llm",
    warnings,
  };
}
