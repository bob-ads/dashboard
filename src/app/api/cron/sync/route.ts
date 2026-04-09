import { NextRequest, NextResponse } from "next/server";
import { syncAllClients } from "@/lib/sync";

// GET /api/cron/sync - Called by Vercel Cron
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncAllClients();
    const totalRows = results.reduce((sum, r) => sum + r.rowsUpserted, 0);
    const totalErrors = results.reduce(
      (sum, r) => sum + r.errors.length,
      0
    );

    return NextResponse.json({
      success: true,
      clientsSynced: results.length,
      totalRowsUpserted: totalRows,
      totalErrors,
      details: results,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
