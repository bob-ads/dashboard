import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncClient } from "@/lib/sync";

// POST /api/sheets/sync
// Body: { clientId: string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId } = body;

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  const result = await syncClient(clientId);
  return NextResponse.json(result);
}
