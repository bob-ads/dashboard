import { google } from "googleapis";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY environment variables"
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

/** Extract spreadsheetId from a Google Sheets URL */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/** Get all tab/sheet names in a spreadsheet */
export async function fetchTabNames(
  spreadsheetId: string
): Promise<string[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  return (
    res.data.sheets?.map((s) => s.properties?.title || "").filter(Boolean) ||
    []
  );
}

/** Get the column headers (first row) of a specific tab */
export async function fetchColumnHeaders(
  spreadsheetId: string,
  tabName: string
): Promise<string[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!1:1`,
  });
  return (res.data.values?.[0] as string[]) || [];
}

/** Fetch all data from a tab (excluding header row) */
export async function fetchTabData(
  spreadsheetId: string,
  tabName: string
): Promise<{ headers: string[]; rows: string[][] }> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'`,
  });

  const values = res.data.values || [];
  if (values.length === 0) return { headers: [], rows: [] };

  const headers = values[0] as string[];
  const rows = values.slice(1) as string[][];
  return { headers, rows };
}

/**
 * Fallback: fetch data from a published Google Sheet CSV URL.
 * Used when service account isn't configured for a sheet.
 */
export async function fetchPublishedCsv(
  publishedUrl: string
): Promise<{ headers: string[]; rows: string[][] }> {
  const response = await fetch(publishedUrl);
  if (!response.ok) throw new Error("Failed to fetch published CSV");

  const text = await response.text();
  const lines = text.trim().split(/\r?\n/);

  // Simple CSV parse - handles basic cases
  function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
}
