import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/clients/[clientId]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      user: { select: { id: true, username: true } },
      sheetConfigs: { include: { columnMappings: true } },
      widgetConfigs: { orderBy: { position: "asc" } },
      shareLinks: true,
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}

// PUT /api/clients/[clientId]
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
  const { name, slug, isActive } = body;

  const client = await prisma.client.update({
    where: { id: clientId },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(client);
}

// DELETE /api/clients/[clientId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;

  // Delete associated user first if exists
  await prisma.user.deleteMany({ where: { clientId } });
  await prisma.client.delete({ where: { id: clientId } });

  return NextResponse.json({ success: true });
}
