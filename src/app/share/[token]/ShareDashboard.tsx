"use client";

import { useState } from "react";
import { subDays, format } from "date-fns";
import useSWR from "swr";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface WidgetConfig {
  id: string;
  widgetType: string;
  title: string;
  position: number;
  gridWidth: number;
  gridHeight: number;
  config: Record<string, unknown>;
}

interface ShareDashboardProps {
  clientId: string;
  token: string;
  widgets: WidgetConfig[];
}

export function ShareDashboard({
  clientId,
  token,
  widgets,
}: ShareDashboardProps) {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [granularity, setGranularity] = useState<"day" | "week" | "month">(
    "day"
  );

  const dataUrl = `/api/clients/${clientId}/data?token=${token}&start=${format(
    dateRange.from,
    "yyyy-MM-dd"
  )}&end=${format(dateRange.to, "yyyy-MM-dd")}&granularity=${granularity}`;

  const { data, isLoading } = useSWR(dataUrl, fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <select
          value={granularity}
          onChange={(e) =>
            setGranularity(e.target.value as "day" | "week" | "month")
          }
          className="h-8 px-2 text-xs border rounded-md bg-background"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-12 gap-4">
          {[3, 3, 3, 3, 12].map((span, i) => (
            <div
              key={i}
              className={`col-span-12 md:col-span-${span} h-32 rounded-xl bg-muted animate-pulse`}
            />
          ))}
        </div>
      ) : data ? (
        <DashboardRenderer
          widgets={widgets}
          data={data}
          granularity={granularity}
        />
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">No data available.</p>
        </div>
      )}
    </div>
  );
}
