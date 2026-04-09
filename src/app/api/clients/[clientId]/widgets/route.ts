import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET /api/clients/[clientId]/widgets
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const widgets = await prisma.widgetConfig.findMany({
    where: { clientId, isVisible: true },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(widgets);
}

// POST /api/clients/[clientId]/widgets
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const body = await req.json();
  const { widgetType, title, position, gridWidth, gridHeight, config } = body;

  const widget = await prisma.widgetConfig.create({
    data: {
      clientId,
      widgetType,
      title,
      position: position ?? 0,
      gridWidth: gridWidth ?? 6,
      gridHeight: gridHeight ?? 1,
      config: config ?? {},
    },
  });

  return NextResponse.json(widget, { status: 201 });
}

// PUT /api/clients/[clientId]/widgets - Bulk update (reorder/resize)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const body = await req.json();
  const { widgets } = body as {
    widgets: Array<{
      id: string;
      position?: number;
      gridWidth?: number;
      gridHeight?: number;
      title?: string;
      config?: Record<string, unknown>;
      isVisible?: boolean;
    }>;
  };

  await prisma.$transaction(
    widgets.map((w) =>
      prisma.widgetConfig.update({
        where: { id: w.id, clientId },
        data: {
          ...(w.position !== undefined && { position: w.position }),
          ...(w.gridWidth !== undefined && { gridWidth: w.gridWidth }),
          ...(w.gridHeight !== undefined && { gridHeight: w.gridHeight }),
          ...(w.title !== undefined && { title: w.title }),
          ...(w.config !== undefined && { config: w.config as Prisma.InputJsonValue }),
          ...(w.isVisible !== undefined && { isVisible: w.isVisible }),
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}

// DELETE /api/clients/[clientId]/widgets?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const widgetId = searchParams.get("id");

  if (!widgetId) {
    return NextResponse.json(
      { error: "Widget ID required" },
      { status: 400 }
    );
  }

  await prisma.widgetConfig.delete({ where: { id: widgetId } });
  return NextResponse.json({ success: true });
}
