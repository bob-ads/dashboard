"use client";

import { useState, useMemo } from "react";
import { formatMetricValue, formatDateLabel } from "@/lib/format";
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";

interface ColumnDef {
  key: string;
  label: string;
  format?: "currency" | "percentage" | "number" | "decimal";
}

interface DataTableProps {
  title: string;
  data: Array<{ date: string; metrics: Record<string, number> }>;
  columns: ColumnDef[];
  granularity?: "day" | "week" | "month";
  pageSize?: number;
  className?: string;
}

export function DataTable({
  title,
  data,
  columns,
  granularity = "day",
  pageSize = 25,
  className,
}: DataTableProps) {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortKey === "date") {
        return sortDir === "asc"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
      const aVal = a.metrics[sortKey] || 0;
      const bVal = b.metrics[sortKey] || 0;
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDir]);

  const paged = sortedData.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCsv() {
    const headers = ["Date", ...columns.map((c) => c.label)];
    const rows = sortedData.map((row) => [
      row.date,
      ...columns.map((c) => row.metrics[c.key]?.toString() || "0"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function SortIcon({ columnKey }: { columnKey: string }) {
    if (sortKey !== columnKey)
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  }

  return (
    <div className={`rounded-xl border bg-card shadow-sm ${className || ""}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download className="h-3 w-3" />
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th
                className="text-left py-2 px-4 font-medium text-muted-foreground cursor-pointer select-none"
                onClick={() => toggleSort("date")}
              >
                <span className="inline-flex items-center">
                  Date
                  <SortIcon columnKey="date" />
                </span>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-right py-2 px-4 font-medium text-muted-foreground cursor-pointer select-none"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="inline-flex items-center justify-end">
                    {col.label}
                    <SortIcon columnKey={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.date} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2 px-4 font-medium">
                  {formatDateLabel(row.date, granularity)}
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="text-right py-2 px-4">
                    {formatMetricValue(
                      row.metrics[col.key] || 0,
                      col.format || "number"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs border rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-xs border rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
