"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { subDays, format } from "date-fns";
import useSWR from "swr";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { ComparisonToggle } from "@/components/dashboard/ComparisonToggle";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PreviewPage() {
  const { clientId } = useParams();
  const [dateRange, setDateRange] = useState({
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

  const { data: dashboardData, isLoading: dataLoading } = useSWR(
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
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/clients/${clientId}`}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Dashboard Preview
          </h2>
          <p className="text-muted-foreground">
            This is how the client sees their dashboard.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <div className="flex items-center gap-4">
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
            <ComparisonToggle value={comparison} onChange={setComparison} />
          </div>
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
        ) : dashboardData && widgets ? (
          <DashboardRenderer
            widgets={widgets}
            data={dashboardData}
            granularity={granularity}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No data available. Make sure data sources are configured and
              synced.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
