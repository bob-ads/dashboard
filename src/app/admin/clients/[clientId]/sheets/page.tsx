"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

interface ColumnMapping {
  sheetColumn: string;
  metricKey: string;
  dataType: string;
  displayName: string;
}

interface SheetConfig {
  id: string;
  spreadsheetUrl: string;
  spreadsheetId: string;
  tabName: string;
  dataCategory: string;
  dateColumn: string;
  dateFormat: string;
  columnMappings: ColumnMapping[];
}

const DATA_CATEGORIES = [
  { value: "AD_METRICS", label: "Ad Metrics (Facebook, Google, etc.)" },
  { value: "LEADS", label: "Leads / Registrations" },
  { value: "SALES", label: "Sales / Revenue" },
  { value: "CUSTOM", label: "Custom" },
];

const DATA_TYPES = ["NUMBER", "CURRENCY", "PERCENTAGE", "TEXT", "DATE"];

export default function SheetsPage() {
  const { clientId } = useParams();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SheetConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // New sheet form state
  const [sheetUrl, setSheetUrl] = useState("");
  const [tabs, setTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [category, setCategory] = useState("AD_METRICS");
  const [dateColumn, setDateColumn] = useState("");
  const [dateFormat, setDateFormat] = useState("MM/dd/yyyy");
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");

  useEffect(() => {
    fetchConfigs();
  }, [clientId]);

  async function fetchConfigs() {
    const res = await fetch(`/api/clients/${clientId}/sheets`);
    if (res.ok) setConfigs(await res.json());
    setLoading(false);
  }

  async function detectTabs() {
    if (!sheetUrl) return;
    setDetecting(true);
    const res = await fetch("/api/sheets/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spreadsheetUrl: sheetUrl }),
    });
    const data = await res.json();
    setDetecting(false);

    if (res.ok) {
      setTabs(data.tabs);
      setSpreadsheetId(data.spreadsheetId);
      toast("Tabs detected successfully", "success");
    } else {
      toast(data.error || "Failed to detect tabs", "destructive");
    }
  }

  async function detectColumns(tabName: string) {
    setSelectedTab(tabName);
    setDetecting(true);
    const res = await fetch("/api/sheets/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spreadsheetUrl: sheetUrl, tabName }),
    });
    const data = await res.json();
    setDetecting(false);

    if (res.ok) {
      setColumns(data.columns);
      setMappings(
        data.columns.map((col: string) => ({
          sheetColumn: col,
          metricKey: col
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, ""),
          dataType: "NUMBER",
          displayName: col,
        }))
      );
      if (data.columns.length > 0) {
        // Auto-detect date column
        const dateCol = data.columns.find(
          (c: string) =>
            c.toLowerCase().includes("date") ||
            c.toLowerCase().includes("created")
        );
        if (dateCol) setDateColumn(dateCol);
      }
    }
  }

  async function saveSheet() {
    const activeMappings = mappings.filter((m) => m.metricKey);

    const res = await fetch(`/api/clients/${clientId}/sheets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spreadsheetId,
        spreadsheetUrl: sheetUrl,
        tabName: selectedTab,
        dataCategory: category,
        dateColumn,
        dateFormat,
        columnMappings: activeMappings,
      }),
    });

    if (res.ok) {
      toast("Data source added", "success");
      setShowAdd(false);
      resetForm();
      fetchConfigs();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to save", "destructive");
    }
  }

  async function deleteConfig(id: string) {
    const res = await fetch(`/api/clients/${clientId}/sheets?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast("Data source removed", "success");
      fetchConfigs();
    }
  }

  async function syncNow() {
    setSyncing(true);
    const res = await fetch("/api/sheets/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
    const data = await res.json();
    setSyncing(false);

    if (res.ok) {
      toast(
        `Synced: ${data.rowsUpserted} rows from ${data.sheetsProcessed} sheets`,
        "success"
      );
    } else {
      toast("Sync failed", "destructive");
    }
  }

  function resetForm() {
    setSheetUrl("");
    setTabs([]);
    setSelectedTab("");
    setColumns([]);
    setCategory("AD_METRICS");
    setDateColumn("");
    setDateFormat("MM/dd/yyyy");
    setMappings([]);
    setSpreadsheetId("");
  }

  if (loading) {
    return <div className="h-64 bg-muted animate-pulse rounded-xl" />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/clients/${clientId}`}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Data Sources</h2>
          <p className="text-muted-foreground">
            Connect Google Sheets and map columns to metrics.
          </p>
        </div>
        <div className="flex gap-2">
          {configs.length > 0 && (
            <button
              onClick={syncNow}
              disabled={syncing}
              className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Now
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </button>
        </div>
      </div>

      {/* Existing configs */}
      {configs.map((config) => (
        <div
          key={config.id}
          className="rounded-xl border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {config.dataCategory.replace("_", " ")}
                </span>
                <span className="font-medium">{config.tabName}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 break-all">
                {config.spreadsheetUrl || config.spreadsheetId}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Date column: {config.dateColumn} | {config.columnMappings.length}{" "}
                mapped columns
              </p>
            </div>
            <button
              onClick={() => deleteConfig(config.id)}
              className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {configs.length === 0 && !showAdd && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No data sources configured. Connect a Google Sheet to get started.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Data Source
          </button>
        </div>
      )}

      {/* Add data source form */}
      {showAdd && (
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
          <h3 className="font-semibold">Add Data Source</h3>

          {/* Step 1: Sheet URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Google Sheet URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <button
                onClick={detectTabs}
                disabled={detecting || !sheetUrl}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {detecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Detect Tabs
              </button>
            </div>
          </div>

          {/* Step 2: Select tab */}
          {tabs.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Tab</label>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => detectColumns(tab)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedTab === tab
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Configure mapping */}
          {columns.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {DATA_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Column</label>
                  <select
                    value={dateColumn}
                    onChange={(e) => setDateColumn(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select date column</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <input
                    type="text"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="MM/dd/yyyy"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Column Mappings</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                          Sheet Column
                        </th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                          Metric Key
                        </th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                          Display Name
                        </th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map((m, i) => (
                        <tr key={m.sheetColumn} className="border-b">
                          <td className="py-2 px-2 font-mono text-xs">
                            {m.sheetColumn}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={m.metricKey}
                              onChange={(e) => {
                                const updated = [...mappings];
                                updated[i] = {
                                  ...updated[i],
                                  metricKey: e.target.value,
                                };
                                setMappings(updated);
                              }}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={m.displayName}
                              onChange={(e) => {
                                const updated = [...mappings];
                                updated[i] = {
                                  ...updated[i],
                                  displayName: e.target.value,
                                };
                                setMappings(updated);
                              }}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={m.dataType}
                              onChange={(e) => {
                                const updated = [...mappings];
                                updated[i] = {
                                  ...updated[i],
                                  dataType: e.target.value,
                                };
                                setMappings(updated);
                              }}
                              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            >
                              {DATA_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3">
            {columns.length > 0 && (
              <button
                onClick={saveSheet}
                disabled={!dateColumn || !selectedTab}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Save Data Source
              </button>
            )}
            <button
              onClick={() => {
                setShowAdd(false);
                resetForm();
              }}
              className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
