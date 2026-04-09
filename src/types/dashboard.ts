// ─── Widget Types ────────────────────────────────────────────────────────────

export enum WidgetType {
  KPI_CARD = "KPI_CARD",
  LINE_CHART = "LINE_CHART",
  BAR_CHART = "BAR_CHART",
  FUNNEL = "FUNNEL",
  DATA_TABLE = "DATA_TABLE",
  COMPARISON_CARD = "COMPARISON_CARD",
}

// ─── Widget Config Types ─────────────────────────────────────────────────────

export interface KpiCardConfig {
  metricKey: string;
  format: "number" | "currency" | "percentage";
  comparisonMetricKey?: string;
  label?: string;
}

export interface LineChartConfig {
  metricKeys: string[];
  xAxisKey: string;
  granularity: Granularity;
  showLegend?: boolean;
  colors?: string[];
}

export interface BarChartConfig {
  metricKeys: string[];
  xAxisKey: string;
  granularity: Granularity;
  stacked?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

export interface FunnelConfig {
  stages: { metricKey: string; label: string }[];
  colors?: string[];
}

export interface DataTableConfig {
  columns: { metricKey: string; header: string; format?: "number" | "currency" | "percentage" | "text" }[];
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface ComparisonCardConfig {
  metricKey: string;
  format: "number" | "currency" | "percentage";
  comparisonLabel?: string;
}

export type WidgetConfigUnion =
  | KpiCardConfig
  | LineChartConfig
  | BarChartConfig
  | FunnelConfig
  | DataTableConfig
  | ComparisonCardConfig;

// ─── Widget Config Interface ─────────────────────────────────────────────────

export interface WidgetConfig {
  id: string;
  clientId: string;
  widgetType: WidgetType;
  title: string;
  position: number;
  gridWidth: number;
  gridHeight: number;
  config: WidgetConfigUnion;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Data Types ──────────────────────────────────────────────────────────────

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

export interface DateRange {
  from: Date;
  to: Date;
}

export type Granularity = "day" | "week" | "month";
