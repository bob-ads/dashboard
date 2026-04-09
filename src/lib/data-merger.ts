import { parse, isValid, format } from "date-fns";

interface ColumnMapping {
  sheetColumn: string;
  metricKey: string;
  dataType: string;
}

interface SheetSyncConfig {
  sheetConfigId: string;
  dataCategory: string;
  dateColumn: string;
  dateFormat: string;
  columnMappings: ColumnMapping[];
}

export interface ParsedMetricRow {
  sheetConfigId: string;
  dataDate: Date;
  metricKey: string;
  metricValue: number;
  rawValue: string;
}

/**
 * Parse a date string using the configured format, with fallbacks
 */
function parseDate(dateStr: string, dateFormat: string): Date | null {
  if (!dateStr) return null;

  // Try configured format first
  let date = parse(dateStr, dateFormat, new Date());
  if (isValid(date)) return date;

  // Fallback formats
  const fallbacks = [
    "MM/dd/yyyy",
    "yyyy-MM-dd",
    "M/d/yyyy",
    "dd/MM/yyyy",
    "MM-dd-yyyy",
    "yyyy/MM/dd",
  ];
  for (const fmt of fallbacks) {
    date = parse(dateStr, fmt, new Date());
    if (isValid(date)) return date;
  }

  // Last resort: native Date parsing
  date = new Date(dateStr);
  return isValid(date) ? date : null;
}

/**
 * Parse numeric values, handling currency symbols, commas, percentages
 */
function parseNumericValue(value: string): number {
  if (!value || value === "-" || value === "N/A") return 0;
  // Remove currency symbols, commas, whitespace
  const cleaned = value.replace(/[$€£,\s]/g, "").replace(/%$/, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse raw sheet data into metric rows for the AD_METRICS category.
 * Each row in the sheet maps to one date, with multiple metrics per row.
 */
export function parseAdMetrics(
  headers: string[],
  rows: string[][],
  config: SheetSyncConfig
): ParsedMetricRow[] {
  const results: ParsedMetricRow[] = [];
  const dateColIndex = headers.indexOf(config.dateColumn);

  if (dateColIndex === -1) return results;

  for (const row of rows) {
    const dateStr = row[dateColIndex];
    const date = parseDate(dateStr, config.dateFormat);
    if (!date) continue;

    for (const mapping of config.columnMappings) {
      const colIndex = headers.indexOf(mapping.sheetColumn);
      if (colIndex === -1) continue;

      const rawValue = row[colIndex] || "0";
      const metricValue = parseNumericValue(rawValue);

      results.push({
        sheetConfigId: config.sheetConfigId,
        dataDate: date,
        metricKey: mapping.metricKey,
        metricValue,
        rawValue,
      });
    }
  }

  return results;
}

/**
 * Parse raw sheet data for the LEADS category.
 * Each row is a lead - we COUNT rows per date.
 */
export function parseLeads(
  headers: string[],
  rows: string[][],
  config: SheetSyncConfig
): ParsedMetricRow[] {
  const dateColIndex = headers.indexOf(config.dateColumn);
  if (dateColIndex === -1) return [];

  // Count leads per date
  const leadsByDate = new Map<string, number>();

  for (const row of rows) {
    const dateStr = row[dateColIndex];
    const date = parseDate(dateStr, config.dateFormat);
    if (!date) continue;

    const dateKey = format(date, "yyyy-MM-dd");
    leadsByDate.set(dateKey, (leadsByDate.get(dateKey) || 0) + 1);
  }

  // Also extract any explicitly mapped numeric columns per date
  // (e.g., if leads sheet has a "revenue" column too)
  const extraMetrics = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const dateStr = row[dateColIndex];
    const date = parseDate(dateStr, config.dateFormat);
    if (!date) continue;
    const dateKey = format(date, "yyyy-MM-dd");

    for (const mapping of config.columnMappings) {
      if (mapping.metricKey === "lead_count") continue; // auto-calculated
      const colIndex = headers.indexOf(mapping.sheetColumn);
      if (colIndex === -1) continue;

      const rawValue = row[colIndex] || "0";
      const value = parseNumericValue(rawValue);

      if (!extraMetrics.has(dateKey)) extraMetrics.set(dateKey, new Map());
      const existing = extraMetrics.get(dateKey)!.get(mapping.metricKey) || 0;
      extraMetrics.get(dateKey)!.set(mapping.metricKey, existing + value);
    }
  }

  const results: ParsedMetricRow[] = [];

  for (const [dateKey, count] of leadsByDate) {
    results.push({
      sheetConfigId: config.sheetConfigId,
      dataDate: new Date(dateKey),
      metricKey: "lead_count",
      metricValue: count,
      rawValue: count.toString(),
    });

    // Add extra mapped metrics for this date
    const extras = extraMetrics.get(dateKey);
    if (extras) {
      for (const [key, value] of extras) {
        results.push({
          sheetConfigId: config.sheetConfigId,
          dataDate: new Date(dateKey),
          metricKey: key,
          metricValue: value,
          rawValue: value.toString(),
        });
      }
    }
  }

  return results;
}

/**
 * Merge cached metric rows into unified date-keyed records.
 */
export function mergeMetricsByDate(
  rows: Array<{ dataDate: Date; metricKey: string; metricValue: number }>
): Map<string, Record<string, number>> {
  const merged = new Map<string, Record<string, number>>();

  for (const row of rows) {
    const dateKey = format(row.dataDate, "yyyy-MM-dd");
    if (!merged.has(dateKey)) merged.set(dateKey, {});
    merged.get(dateKey)![row.metricKey] = row.metricValue;
  }

  return merged;
}

/**
 * Calculate derived metrics from merged data.
 */
export function calculateDerivedMetrics(
  metrics: Record<string, number>
): Record<string, number> {
  const derived: Record<string, number> = {};

  // Cost Per Lead
  if (metrics.amount_spent && metrics.lead_count) {
    derived.cost_per_lead =
      metrics.lead_count > 0
        ? Math.round((metrics.amount_spent / metrics.lead_count) * 100) / 100
        : 0;
  }

  // Click-Through Rate (if not already provided by the ad platform)
  if (
    metrics.impressions &&
    metrics.link_clicks &&
    !metrics.click_through_rate
  ) {
    derived.click_through_rate =
      metrics.impressions > 0
        ? Math.round(
            (metrics.link_clicks / metrics.impressions) * 100 * 100
          ) / 100
        : 0;
  }

  // Conversion Rate (leads / clicks)
  if (metrics.link_clicks && metrics.lead_count) {
    derived.conversion_rate =
      metrics.link_clicks > 0
        ? Math.round(
            (metrics.lead_count / metrics.link_clicks) * 100 * 100
          ) / 100
        : 0;
  }

  // Cost Per Click
  if (metrics.amount_spent && metrics.link_clicks) {
    derived.cost_per_click =
      metrics.link_clicks > 0
        ? Math.round((metrics.amount_spent / metrics.link_clicks) * 100) / 100
        : 0;
  }

  return derived;
}
