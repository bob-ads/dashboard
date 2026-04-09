import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDashboardData, getComparisonRange } from "@/lib/data-aggregator";
import type { Granularity } from "@/lib/data-aggregator";

// GET /api/clients/[clientId]/data?start=2026-01-01&end=2026-04-09&granularity=day&comparison=previous_period
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;

  // Auth check: admin, the client's own user, or share token
  const session = await auth();
  const shareToken = req.nextUrl.searchParams.get("token");

  if (!session && !shareToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session && session.user.role === "CLIENT" && session.user.clientId !== clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (shareToken) {
    const link = await prisma.shareLink.findUnique({
      where: { token: shareToken },
    });
    if (
      !link ||
      !link.isActive ||
      link.clientId !== clientId ||
      (link.expiresAt && link.expiresAt < new Date())
    ) {
      return NextResponse.json({ error: "Invalid share link" }, { status: 403 });
    }
  }

  // Parse query parameters
  const searchParams = req.nextUrl.searchParams;
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const granularity = (searchParams.get("granularity") || "day") as Granularity;
  const comparisonType = searchParams.get("comparison");

  // Default date range: last 30 days
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch cached data for the date range
  const cachedRows = await prisma.cachedSheetData.findMany({
    where: {
      clientId,
      dataDate: { gte: start, lte: end },
    },
    select: { dataDate: true, metricKey: true, metricValue: true },
  });

  // Fetch comparison data if requested
  let comparisonRows: typeof cachedRows | undefined;
  if (comparisonType) {
    const compRange = getComparisonRange(start, end, comparisonType);
    if (compRange) {
      comparisonRows = await prisma.cachedSheetData.findMany({
        where: {
          clientId,
          dataDate: { gte: compRange.from, lte: compRange.to },
        },
        select: { dataDate: true, metricKey: true, metricValue: true },
      });
    }
  }

  const dashboardData = buildDashboardData(
    cachedRows,
    granularity,
    comparisonRows
  );

  return NextResponse.json(dashboardData, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
