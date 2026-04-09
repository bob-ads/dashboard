"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatMetricValue, percentageChange } from "@/lib/format";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: "currency" | "percentage" | "number" | "decimal";
  className?: string;
}

export function KpiCard({
  title,
  value,
  previousValue,
  format = "number",
  className,
}: KpiCardProps) {
  const formattedValue = formatMetricValue(value, format);
  const change =
    previousValue !== undefined
      ? percentageChange(value, previousValue)
      : null;

  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold mt-2 tracking-tight">{formattedValue}</p>
      {change !== null && (
        <div className="flex items-center gap-1 mt-2">
          {change > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : change < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-600" />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              change > 0
                ? "text-green-600"
                : change < 0
                ? "text-red-600"
                : "text-muted-foreground"
            )}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          <span className="text-sm text-muted-foreground">vs prev</span>
        </div>
      )}
    </div>
  );
}
