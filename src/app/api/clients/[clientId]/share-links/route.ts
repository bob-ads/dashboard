import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/clients/[clientId]/share-links
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const links = await prisma.shareLink.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

// POST /api/clients/[clientId]/share-links
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
  const { label, expiresAt } = body;

  const link = await prisma.shareLink.create({
    data: {
      clientId,
      label: label || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(link, { status: 201 });
}

// DELETE /api/clients/[clientId]/share-links?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get("id");

  if (!linkId) {
    return NextResponse.json(
      { error: "Link ID required" },
      { status: 400 }
    );
  }

  await prisma.shareLink.update({
    where: { id: linkId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
