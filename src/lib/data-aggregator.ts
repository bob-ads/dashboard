import {
  startOfWeek,
  startOfMonth,
  format,
  parseISO,
  isWithinInterval,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import {
  mergeMetricsByDate,
  calculateDerivedMetrics,
} from "./data-merger";

export type Granularity = "day" | "week" | "month";

export interface MetricDataPoint {
  date: string;
  metrics: Record<string, number>;
}

export interface DashboardData {
  dataPoints: MetricDataPoint[];
  summary: Record<string, number>;
  comparison?: {
    dataPoints: MetricDataPoint[];
    summary: Record<string, number>;
  };
}

/**
 * Aggregate merged daily data by the given granularity.
 */
export function aggregateByGranularity(
  dailyData: Map<string, Record<string, number>>,
  granularity: Granularity
): MetricDataPoint[] {
  if (granularity === "day") {
    return Array.from(dailyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, metrics]) => ({
        date,
        metrics: { ...metrics, ...calculateDerivedMetrics(metrics) },
      }));
  }

  // Group by period
  const grouped = new Map<string, Record<string, number>>();

  for (const [dateStr, metrics] of dailyData) {
    const date = parseISO(dateStr);
    const periodKey =
      granularity === "week"
        ? format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
        : format(startOfMonth(date), "yyyy-MM-dd");

    if (!grouped.has(periodKey)) grouped.set(periodKey, {});
    const existing = grouped.get(periodKey)!;

    // Sum all numeric metrics
    for (const [key, value] of Object.entries(metrics)) {
      existing[key] = (existing[key] || 0) + value;
    }
  }

  // Recalculate derived metrics on aggregated data
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, metrics]) => ({
      date,
      metrics: { ...metrics, ...calculateDerivedMetrics(metrics) },
    }));
}

/**
 * Calculate summary totals for a set of data points.
 */
export function calculateSummary(
  dataPoints: MetricDataPoint[]
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const point of dataPoints) {
    for (const [key, value] of Object.entries(point.metrics)) {
      totals[key] = (totals[key] || 0) + value;
    }
  }

  // Recalculate ratio metrics from totals (not sum of daily ratios)
  return { ...totals, ...calculateDerivedMetrics(totals) };
}

/**
 * Get the comparison date range for a given period.
 */
export function getComparisonRange(
  from: Date,
  to: Date,
  comparisonType: string
): { from: Date; to: Date } | null {
  const daysDiff = Math.ceil(
    (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (comparisonType) {
    case "previous_period":
      return {
        from: subDays(from, daysDiff + 1),
        to: subDays(from, 1),
      };
    case "previous_week":
      return {
        from: subWeeks(from, 1),
        to: subWeeks(to, 1),
      };
    case "previous_month":
      return {
        from: subMonths(from, 1),
        to: subMonths(to, 1),
      };
    default:
      return null;
  }
}

/**
 * Build the full dashboard data response from raw cached rows.
 */
export function buildDashboardData(
  cachedRows: Array<{
    dataDate: Date;
    metricKey: string;
    metricValue: number;
  }>,
  granularity: Granularity,
  comparisonRows?: Array<{
    dataDate: Date;
    metricKey: string;
    metricValue: number;
  }>
): DashboardData {
  const merged = mergeMetricsByDate(cachedRows);
  const dataPoints = aggregateByGranularity(merged, granularity);
  const summary = calculateSummary(dataPoints);

  const result: DashboardData = { dataPoints, summary };

  if (comparisonRows && comparisonRows.length > 0) {
    const compMerged = mergeMetricsByDate(comparisonRows);
    const compDataPoints = aggregateByGranularity(compMerged, granularity);
    const compSummary = calculateSummary(compDataPoints);
    result.comparison = { dataPoints: compDataPoints, summary: compSummary };
  }

  return result;
}
