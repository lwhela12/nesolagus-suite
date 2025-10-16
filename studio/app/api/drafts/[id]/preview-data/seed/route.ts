import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateDashboardPreviewWithLLM } from "@/lib/dashboardPreviewLLM";
import type { DashboardConfig } from "@nesolagus/config";

function coerceNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let body: Record<string, unknown> | null = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const draft = await prisma.draft.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        config: true,
        dashboardConfig: true,
      },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const requestedCount = coerceNumber(body?.count);
    const personaHint =
      typeof body?.personaHint === "string"
        ? body.personaHint
        : typeof body?.persona === "string"
        ? body.persona
        : undefined;
    const scenario = typeof body?.scenario === "string" ? body.scenario : undefined;
    const audience = typeof body?.audience === "string" ? body.audience : undefined;
    const surveyTitle = typeof body?.surveyTitle === "string" ? body.surveyTitle : undefined;

    const result = await generateDashboardPreviewWithLLM({
      draftId: draft.id,
      config: draft.config,
      dashboardConfig: draft.dashboardConfig as DashboardConfig | null,
      requestedCount,
      personaHint,
      scenario,
      audience,
      surveyTitle,
    });

    await prisma.draft.update({
      where: { id: draft.id },
      data: {
        dashboardPreview: result.preview,
        dashboardPreviewResponses:
          result.responses.length > 0 ? result.responses : Prisma.JsonNull,
      },
    });

    return NextResponse.json({
      dashboardPreview: result.preview,
      generatedResponses: result.responses.length,
      source: result.source,
      warnings: result.warnings,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Database schema is missing dashboardPreview column. Run prisma migrate." },
        { status: 500 }
      );
    }
    console.error("Error seeding dashboard preview:", error);
    return NextResponse.json(
      {
        error: "Failed to generate preview",
      },
      { status: 500 }
    );
  }
}
