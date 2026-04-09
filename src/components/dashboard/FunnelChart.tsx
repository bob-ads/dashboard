"use client";

import { formatMetricValue } from "@/lib/format";

interface FunnelStage {
  label: string;
  metricKey: string;
  color: string;
}

interface FunnelChartProps {
  title: string;
  summary: Record<string, number>;
  stages: FunnelStage[];
  className?: string;
}

export function FunnelChart({
  title,
  summary,
  stages,
  className,
}: FunnelChartProps) {
  const maxValue = Math.max(
    ...stages.map((s) => summary[s.metricKey] || 0),
    1
  );

  return (
    <div className={`rounded-xl border bg-card p-6 shadow-sm ${className || ""}`}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const value = summary[stage.metricKey] || 0;
          const widthPercent = Math.max((value / maxValue) * 100, 8);
          const prevValue =
            index > 0
              ? summary[stages[index - 1].metricKey] || 0
              : null;
          const dropOff =
            prevValue && prevValue > 0
              ? ((prevValue - value) / prevValue * 100).toFixed(1)
              : null;

          return (
            <div key={stage.metricKey}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {formatMetricValue(value)}
                  </span>
                  {dropOff && (
                    <span className="text-xs text-muted-foreground">
                      (-{dropOff}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md transition-all duration-500 flex items-center justify-center"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  {widthPercent > 20 && (
                    <span className="text-xs font-medium text-white">
                      {formatMetricValue(value)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
