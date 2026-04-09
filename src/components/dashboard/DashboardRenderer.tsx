"use client";

import { KpiCard } from "./KpiCard";
import { MetricLineChart } from "./MetricLineChart";
import { MetricBarChart } from "./MetricBarChart";
import { FunnelChart } from "./FunnelChart";
import { DataTable } from "./DataTable";

interface WidgetConfig {
  id: string;
  widgetType: string;
  title: string;
  position: number;
  gridWidth: number;
  gridHeight: number;
  config: Record<string, unknown>;
}

interface DashboardData {
  dataPoints: Array<{ date: string; metrics: Record<string, number> }>;
  summary: Record<string, number>;
  comparison?: {
    dataPoints: Array<{ date: string; metrics: Record<string, number> }>;
    summary: Record<string, number>;
  };
}

interface DashboardRendererProps {
  widgets: WidgetConfig[];
  data: DashboardData;
  granularity?: "day" | "week" | "month";
}

// Default chart colors
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function DashboardRenderer({
  widgets,
  data,
  granularity = "day",
}: DashboardRendererProps) {
  if (widgets.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          No dashboard widgets configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {widgets.map((widget) => {
        const config = widget.config as Record<string, unknown>;
        const colSpan = `col-span-12 md:col-span-${Math.min(widget.gridWidth, 12)}`;

        switch (widget.widgetType) {
          case "KPI_CARD": {
            const metricKey = (config.metricKey as string) || "";
            const fmt = (config.format as "currency" | "percentage" | "number" | "decimal") || "number";
            const value = data.summary[metricKey] || 0;
            const prevValue = data.comparison?.summary[metricKey];

            return (
              <div key={widget.id} className={colSpan}>
                <KpiCard
                  title={widget.title}
                  value={value}
                  previousValue={prevValue}
                  format={fmt}
                />
              </div>
            );
          }

          case "LINE_CHART": {
            const metrics = (config.metrics as Array<{
              key: string;
              label: string;
              color?: string;
              format?: string;
            }>) || [];

            const series = metrics.map((m, i) => ({
              key: m.key,
              label: m.label || m.key,
              color: m.color || COLORS[i % COLORS.length],
              format: (m.format as "currency" | "percentage" | "number" | "decimal") || "number",
            }));

            return (
              <div key={widget.id} className={colSpan}>
                <MetricLineChart
                  title={widget.title}
                  data={data.dataPoints}
                  series={series}
                  granularity={granularity}
                />
              </div>
            );
          }

          case "BAR_CHART": {
            const metrics = (config.metrics as Array<{
              key: string;
              label: string;
              color?: string;
              format?: string;
            }>) || [];

            const series = metrics.map((m, i) => ({
              key: m.key,
              label: m.label || m.key,
              color: m.color || COLORS[i % COLORS.length],
              format: (m.format as "currency" | "percentage" | "number" | "decimal") || "number",
            }));

            return (
              <div key={widget.id} className={colSpan}>
                <MetricBarChart
                  title={widget.title}
                  data={data.dataPoints}
                  series={series}
                  granularity={granularity}
                />
              </div>
            );
          }

          case "FUNNEL": {
            const stages = (config.stages as Array<{
              metricKey: string;
              label: string;
              color?: string;
            }>) || [];

            const funnelStages = stages.map((s, i) => ({
              label: s.label,
              metricKey: s.metricKey,
              color: s.color || COLORS[i % COLORS.length],
            }));

            return (
              <div key={widget.id} className={colSpan}>
                <FunnelChart
                  title={widget.title}
                  summary={data.summary}
                  stages={funnelStages}
                />
              </div>
            );
          }

          case "DATA_TABLE": {
            const columns = (config.columns as Array<{
              key: string;
              label: string;
              format?: string;
            }>) || [];

            const colDefs = columns.map((c) => ({
              key: c.key,
              label: c.label || c.key,
              format: (c.format as "currency" | "percentage" | "number" | "decimal") || "number",
            }));

            return (
              <div key={widget.id} className={colSpan}>
                <DataTable
                  title={widget.title}
                  data={data.dataPoints}
                  columns={colDefs}
                  granularity={granularity}
                  pageSize={(config.pageSize as number) || 25}
                />
              </div>
            );
          }

          case "COMPARISON_CARD": {
            const metricKey = (config.metricKey as string) || "";
            const fmt = (config.format as "currency" | "percentage" | "number" | "decimal") || "number";
            const value = data.summary[metricKey] || 0;
            const prevValue = data.comparison?.summary[metricKey];

            return (
              <div key={widget.id} className={colSpan}>
                <KpiCard
                  title={widget.title}
                  value={value}
                  previousValue={prevValue}
                  format={fmt}
                />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
