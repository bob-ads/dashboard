import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/clients - List all clients
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    include: {
      user: { select: { id: true, username: true } },
      sheetConfigs: { select: { id: true, tabName: true, dataCategory: true } },
      _count: { select: { widgetConfigs: true, shareLinks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

// POST /api/clients - Create a new client
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, username, password } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const existing = await prisma.client.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A client with this slug already exists" },
      { status: 409 }
    );
  }

  // Create client and optionally a user account
  const client = await prisma.client.create({
    data: {
      name,
      slug,
      ...(username && password
        ? {
            user: {
              create: {
                username,
                passwordHash: await bcrypt.hash(password, 10),
                role: "CLIENT",
              },
            },
          }
        : {}),
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });

  return NextResponse.json(client, { status: 201 });
}
