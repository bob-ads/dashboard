"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatMetricValue, formatDateLabel } from "@/lib/format";

interface MetricSeries {
  key: string;
  label: string;
  color: string;
  format?: "currency" | "percentage" | "number" | "decimal";
}

interface MetricBarChartProps {
  title: string;
  data: Array<{ date: string; metrics: Record<string, number> }>;
  series: MetricSeries[];
  granularity?: "day" | "week" | "month";
  className?: string;
}

export function MetricBarChart({
  title,
  data,
  series,
  granularity = "day",
  className,
}: MetricBarChartProps) {
  const chartData = data.map((d) => ({
    date: formatDateLabel(d.date, granularity),
    ...d.metrics,
  }));

  return (
    <div className={`rounded-xl border bg-card p-6 shadow-sm ${className || ""}`}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                formatMetricValue(v, series[0]?.format || "number")
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value, name) => {
                const s = series.find((s) => s.key === name);
                return [
                  formatMetricValue(Number(value), s?.format || "number"),
                  s?.label || String(name),
                ];
              }}
            />
            {series.length > 1 && <Legend />}
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.key}
                fill={s.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
