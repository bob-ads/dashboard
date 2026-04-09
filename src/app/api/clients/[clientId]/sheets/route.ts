import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/clients/[clientId]/sheets
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const configs = await prisma.sheetConfig.findMany({
    where: { clientId },
    include: { columnMappings: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(configs);
}

// POST /api/clients/[clientId]/sheets
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
  const {
    spreadsheetId,
    spreadsheetUrl,
    tabName,
    dataCategory,
    dateColumn,
    dateFormat,
    columnMappings,
  } = body;

  if (!spreadsheetId || !tabName || !dataCategory || !dateColumn) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const config = await prisma.sheetConfig.create({
    data: {
      clientId,
      spreadsheetId,
      spreadsheetUrl: spreadsheetUrl || "",
      tabName,
      dataCategory,
      dateColumn,
      dateFormat: dateFormat || "MM/dd/yyyy",
      columnMappings: {
        create:
          columnMappings?.map(
            (m: {
              sheetColumn: string;
              metricKey: string;
              dataType: string;
              displayName: string;
            }) => ({
              sheetColumn: m.sheetColumn,
              metricKey: m.metricKey,
              dataType: m.dataType || "NUMBER",
              displayName: m.displayName || m.sheetColumn,
            })
          ) || [],
      },
    },
    include: { columnMappings: true },
  });

  return NextResponse.json(config, { status: 201 });
}

// DELETE /api/clients/[clientId]/sheets (with sheetConfigId in body)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sheetConfigId = searchParams.get("id");

  if (!sheetConfigId) {
    return NextResponse.json(
      { error: "Sheet config ID required" },
      { status: 400 }
    );
  }

  await prisma.sheetConfig.delete({ where: { id: sheetConfigId } });
  return NextResponse.json({ success: true });
}
