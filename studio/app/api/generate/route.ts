import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateClientSlug } from "@/lib/utils";

// Import existing pipeline (Node.js modules)
// NOTE: These paths may need adjustment based on actual structure
const pipeline = require("@/src/pipeline");

/**
 * Strip null bytes and other invalid UTF-8 characters from text
 */
function cleanText(text: string): string {
  // Remove null bytes and other control characters except newlines and tabs
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientName,
      discoveryDoc,
      methodologyDoc,
      maxMinutes = 8,
      tone,
      segments,
      archetypes,
    } = body;

    // Validate required fields
    if (!clientName || !discoveryDoc || !methodologyDoc) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Clean documents to remove null bytes
    const cleanDiscoveryDoc = cleanText(discoveryDoc);
    const cleanMethodologyDoc = cleanText(methodologyDoc);

    // Generate client slug
    const clientSlug = generateClientSlug(clientName);

    // Check if client exists, if not create it
    let client = await prisma.client.findUnique({
      where: { slug: clientSlug },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          slug: clientSlug,
        },
      });
    }

    // Parse tone, segments, archetypes from comma-separated strings
    const toneArray = tone ? tone.split(",").map((t: string) => t.trim()) : [];
    const segmentsArray = segments
      ? segments.split(",").map((s: string) => s.trim())
      : [];
    const archetypesArray = archetypes
      ? archetypes.split(",").map((a: string) => a.trim())
      : [];

    // Create draft
    const draft = await prisma.draft.create({
      data: {
        clientId: client.id,
        discoveryDoc: cleanDiscoveryDoc,
        methodologyDoc: cleanMethodologyDoc,
        maxMinutes,
        tone: toneArray,
        segments: segmentsArray,
        archetypes: archetypesArray,
        status: "NEW",
        config: {}, // Empty initially
      },
    });

    // Start generation asynchronously
    // NOTE: In production, this should use a job queue (Bull, BullMQ, etc.)
    generateSurveyAsync(draft.id, {
      clientName,
      discoveryDoc: cleanDiscoveryDoc,
      methodologyDoc: cleanMethodologyDoc,
      maxMinutes,
      tone: toneArray,
      segments: segmentsArray,
      archetypes: archetypesArray,
    }).catch((error) => {
      console.error("Generation failed:", error);
      // Update draft with error
      prisma.draft.update({
        where: { id: draft.id },
        data: {
          status: "VALIDATION_FAILED",
          validationErrors: {
            error: error.message || "Unknown error",
          },
        },
      });
    });

    return NextResponse.json({
      draftId: draft.id,
      status: "GENERATING",
      message: "Survey generation started",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate survey asynchronously
 * This function runs the existing CLI pipeline and updates the draft when complete
 */
async function generateSurveyAsync(
  draftId: string,
  params: {
    clientName: string;
    discoveryDoc: string;
    methodologyDoc: string;
    maxMinutes: number;
    tone: string[];
    segments: string[];
    archetypes: string[];
  }
) {
  const startTime = Date.now();

  try {
    // Update status to GENERATING
    await prisma.draft.update({
      where: { id: draftId },
      data: { status: "GENERATING" },
    });

    // Run the pipeline with correct format
    const result = await pipeline.runPipeline({
      sources: [
        { title: "Discovery Document", text: params.discoveryDoc },
        { title: "Methodology Document", text: params.methodologyDoc },
      ],
      params: {
        client: params.clientName,
        tone: params.tone,
        segments: params.segments,
        archetypes: params.archetypes,
        constraints: {
          max_minutes: params.maxMinutes,
        },
      },
    });

    const generationTime = Date.now() - startTime;

    // Update draft with generated config
    await prisma.draft.update({
      where: { id: draftId },
      data: {
        config: result.config,
        methodBrief: result.methodBrief,
        status: "GENERATED",
        llmModel: result.provenance?.model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        llmTokens: result.provenance?.tokensUsed || undefined,
        generationTime,
        validationErrors: result.issues && result.issues.length > 0 ? { issues: result.issues } : undefined,
      },
    });

    console.log(`Survey generated successfully for draft ${draftId} in ${generationTime}ms`);
  } catch (error) {
    console.error(`Generation failed for draft ${draftId}:`, error);

    await prisma.draft.update({
      where: { id: draftId },
      data: {
        status: "VALIDATION_FAILED",
        validationErrors: {
          error: error instanceof Error ? error.message : "Generation failed",
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
    });

    throw error;
  }
}
