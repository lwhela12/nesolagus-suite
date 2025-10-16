import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const draft = await prisma.draft.findUnique({
      where: { id: params.id },
      select: {
        dashboardPreview: true,
        dashboardPreviewResponses: true,
        updatedAt: true,
      },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({
      dashboardPreview: draft.dashboardPreview ?? null,
      dashboardPreviewResponses: draft.dashboardPreviewResponses ?? null,
      updatedAt: draft.updatedAt,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Database schema is missing dashboardPreview column. Run prisma migrate." },
        { status: 500 }
      );
    }
    console.error("Error fetching dashboard preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { summary, questionStats, responses } = body ?? {};

    if (!summary && !questionStats) {
      return NextResponse.json(
        { error: "dashboard preview must include at least summary or questionStats" },
        { status: 400 }
      );
    }

    const draft = await prisma.draft.update({
      where: { id: params.id },
      data: {
        dashboardPreview: {
          summary: summary ?? null,
          questionStats: questionStats ?? [],
        },
        dashboardPreviewResponses: responses ?? null,
      },
      select: {
        dashboardPreview: true,
        dashboardPreviewResponses: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      dashboardPreview: draft.dashboardPreview,
      dashboardPreviewResponses: draft.dashboardPreviewResponses ?? null,
      updatedAt: draft.updatedAt,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Database schema is missing dashboardPreview column. Run prisma migrate." },
        { status: 500 }
      );
    }
    console.error("Error updating dashboard preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.draft.update({
      where: { id: params.id },
      data: {
        dashboardPreview: Prisma.DbNull,
        dashboardPreviewResponses: Prisma.DbNull
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Database schema is missing dashboardPreview column. Run prisma migrate." },
        { status: 500 }
      );
    }
    console.error("Error clearing dashboard preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
