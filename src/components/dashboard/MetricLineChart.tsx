"use client";

import {
  LineChart,
  Line,
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

interface MetricLineChartProps {
  title: string;
  data: Array<{ date: string; metrics: Record<string, number> }>;
  series: MetricSeries[];
  granularity?: "day" | "week" | "month";
  className?: string;
}

export function MetricLineChart({
  title,
  data,
  series,
  granularity = "day",
  className,
}: MetricLineChartProps) {
  const chartData = data.map((d) => ({
    date: formatDateLabel(d.date, granularity),
    ...d.metrics,
  }));

  return (
    <div className={`rounded-xl border bg-card p-6 shadow-sm ${className || ""}`}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
