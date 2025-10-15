import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const draft = await prisma.draft.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: draft.id,
      status: draft.status,
      config: draft.config,
      flowLayout: draft.flowLayout,
      methodBrief: draft.methodBrief,
      validationErrors: draft.validationErrors,
      client: draft.client,
      metadata: {
        llmModel: draft.llmModel,
        llmTokens: draft.llmTokens,
        generationTime: draft.generationTime,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: "Config is required" },
        { status: 400 }
      );
    }

    const draft = await prisma.draft.update({
      where: { id },
      data: {
        config,
        status: "READY", // Mark as ready after manual edit
      },
    });

    return NextResponse.json({
      id: draft.id,
      status: draft.status,
      message: "Draft updated successfully",
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { flowLayout, config } = body;

    // Update flowLayout and/or config
    const updateData: any = {};
    if (flowLayout !== undefined) {
      updateData.flowLayout = flowLayout;
    }
    if (config !== undefined) {
      updateData.config = config;
      updateData.status = "READY"; // Mark as ready after manual edit
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const draft = await prisma.draft.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: draft.id,
      status: draft.status,
      message: "Draft updated successfully",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.draft.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Draft deleted successfully",
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
