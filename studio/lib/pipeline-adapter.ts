/**
 * Pipeline Adapter
 *
 * This adapter integrates the existing CLI pipeline with the Next.js API.
 * It provides a clean interface for the API routes to call the generation pipeline.
 */

// Import existing pipeline modules
// NOTE: These paths will need to be adjusted based on actual module structure
import { runPipeline } from "../src/pipeline";

export interface GenerationParams {
  client: string;
  discovery: string;
  methodology: string;
  maxMinutes: number;
  tone?: string[];
  segments?: string[];
  archetypes?: string[];
}

export interface GenerationResult {
  config: any;
  methodBrief?: any;
  metadata: {
    tokensUsed?: number;
    model?: string;
    duration?: number;
  };
}

/**
 * Generate survey using the existing CLI pipeline
 */
export async function generateSurvey(
  params: GenerationParams
): Promise<GenerationResult> {
  const startTime = Date.now();

  try {
    // Call the existing pipeline
    // This is a placeholder - adjust to match your actual pipeline API
    const result = await runPipeline({
      sources: [
        { title: "Discovery Document", text: params.discovery },
        { title: "Methodology Document", text: params.methodology },
      ],
      params: {
        client: params.client,
        tone: params.tone || [],
        segments: params.segments || [],
        archetypes: params.archetypes || [],
        constraints: {
          max_minutes: params.maxMinutes,
        },
      },
    });

    const duration = Date.now() - startTime;

    return {
      config: result.config,
      methodBrief: result.methodBrief,
      metadata: {
        tokensUsed: result.provenance?.tokensUsed,
        model: result.provenance?.model,
        duration,
      },
    };
  } catch (error) {
    console.error("Pipeline error:", error);
    throw new Error(
      `Survey generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Validate survey configuration
 */
export async function validateSurveyConfig(config: any): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  // Import existing validation logic
  // This is a placeholder
  try {
    // Run validation
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic checks
    if (!config.survey) {
      errors.push("Missing survey metadata");
    }

    if (!config.blocks || Object.keys(config.blocks).length === 0) {
      errors.push("Survey must have at least one block");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        error instanceof Error ? error.message : "Validation failed",
      ],
      warnings: [],
    };
  }
}
