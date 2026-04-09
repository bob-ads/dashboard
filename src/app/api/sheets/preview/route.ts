import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  extractSpreadsheetId,
  fetchTabNames,
  fetchColumnHeaders,
} from "@/lib/google-sheets";

// POST /api/sheets/preview
// Body: { spreadsheetUrl: string, tabName?: string }
// Returns: { spreadsheetId, tabs } or { spreadsheetId, tabName, columns }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { spreadsheetUrl, tabName } = body;

  if (!spreadsheetUrl) {
    return NextResponse.json(
      { error: "spreadsheetUrl is required" },
      { status: 400 }
    );
  }

  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    return NextResponse.json(
      { error: "Invalid Google Sheets URL" },
      { status: 400 }
    );
  }

  try {
    if (tabName) {
      // Return column headers for a specific tab
      const columns = await fetchColumnHeaders(spreadsheetId, tabName);
      return NextResponse.json({ spreadsheetId, tabName, columns });
    } else {
      // Return list of tabs
      const tabs = await fetchTabNames(spreadsheetId);
      return NextResponse.json({ spreadsheetId, tabs });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to access sheet";
    return NextResponse.json(
      {
        error: "Could not access the Google Sheet. Make sure it's shared with the service account.",
        details: message,
      },
      { status: 400 }
    );
  }
}
