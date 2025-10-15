import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/clients/[slug]/theme
 * Fetch theme configuration for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const client = await prisma.client.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        theme: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        slug: client.slug,
      },
      theme: client.theme || null,
    });
  } catch (error) {
    console.error("Error fetching client theme:", error);
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
 * PUT /api/clients/[slug]/theme
 * Update theme configuration for a client
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { theme } = body;

    if (!theme || typeof theme !== "object") {
      return NextResponse.json(
        { error: "Invalid theme data" },
        { status: 400 }
      );
    }

    // Validate theme structure (basic validation)
    if (theme.colors && typeof theme.colors !== "object") {
      return NextResponse.json(
        { error: "Invalid colors format" },
        { status: 400 }
      );
    }

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { slug },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Update client theme
    const updatedClient = await prisma.client.update({
      where: { slug },
      data: {
        theme,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        theme: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Theme updated successfully",
      client: {
        id: updatedClient.id,
        name: updatedClient.name,
        slug: updatedClient.slug,
      },
      theme: updatedClient.theme,
      updatedAt: updatedClient.updatedAt,
    });
  } catch (error) {
    console.error("Error updating client theme:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
