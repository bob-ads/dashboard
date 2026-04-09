"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { subDays, format } from "date-fns";
import useSWR from "swr";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { ComparisonToggle } from "@/components/dashboard/ComparisonToggle";
import { RefreshCw } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface DateRange {
  from: Date;
  to: Date;
}

export default function ClientDashboard() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [granularity, setGranularity] = useState<"day" | "week" | "month">(
    "day"
  );
  const [comparison, setComparison] = useState("");

  const dataUrl = `/api/clients/${clientId}/data?start=${format(
    dateRange.from,
    "yyyy-MM-dd"
  )}&end=${format(dateRange.to, "yyyy-MM-dd")}&granularity=${granularity}${
    comparison ? `&comparison=${comparison}` : ""
  }`;

  const { data: dashboardData, isLoading: dataLoading, mutate } = useSWR(
    dataUrl,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: widgets, isLoading: widgetsLoading } = useSWR(
    `/api/clients/${clientId}/widgets`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const isLoading = dataLoading || widgetsLoading;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              View:
            </span>
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
          <ComparisonToggle value={comparison} onChange={setComparison} />
          <button
            onClick={() => mutate()}
            className="p-1.5 hover:bg-accent rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Dashboard */}
      {isLoading ? (
        <div className="grid grid-cols-12 gap-4">
          {[3, 3, 3, 3, 6, 6, 12].map((span, i) => (
            <div
              key={i}
              className={`col-span-12 md:col-span-${span} h-32 rounded-xl bg-muted animate-pulse`}
            />
          ))}
        </div>
      ) : dashboardData && widgets ? (
        <DashboardRenderer
          widgets={widgets}
          data={dashboardData}
          granularity={granularity}
        />
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No data available for this date range.
          </p>
        </div>
      )}
    </div>
  );
}
