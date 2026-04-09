/**
 * Format a metric value based on its type.
 */
export function formatMetricValue(
  value: number,
  format: "currency" | "percentage" | "number" | "decimal" = "number"
): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    case "percentage":
      return `${value.toFixed(2)}%`;
    case "decimal":
      return value.toFixed(2);
    case "number":
    default:
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(value);
  }
}

/**
 * Format a date string for display.
 */
export function formatDateLabel(
  dateStr: string,
  granularity: "day" | "week" | "month"
): string {
  const date = new Date(dateStr + "T00:00:00");
  switch (granularity) {
    case "day":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "week":
      return `Wk ${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    case "month":
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
  }
}

/**
 * Calculate percentage change between two values.
 */
export function percentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}
