"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Search,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

// ─── Types ──────────────────────────────────────────────────────────────────

type DataCategory = "AD_METRICS" | "LEADS" | "SALES" | "CUSTOM";
type DataType = "NUMBER" | "CURRENCY" | "PERCENTAGE" | "TEXT" | "DATE";
type WidgetType =
  | "KPI_CARD"
  | "LINE_CHART"
  | "BAR_CHART"
  | "FUNNEL"
  | "DATA_TABLE"
  | "COMPARISON_CARD";

interface ColumnMapping {
  id: string;
  sheetColumn: string;
  metricKey: string;
  dataType: DataType;
  displayName: string;
}

interface SheetConfig {
  id: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  tabName: string;
  dataCategory: DataCategory;
  dateColumn: string;
  dateFormat: string;
  columnMappings: ColumnMapping[];
}

interface WidgetConfig {
  id: string;
  widgetType: WidgetType;
  title: string;
  position: number;
  gridWidth: number;
  gridHeight: number;
  config: Record<string, unknown>;
  isVisible: boolean;
}

interface ClientData {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  user?: { id: string; username: string } | null;
  sheetConfigs: SheetConfig[];
  widgetConfigs: WidgetConfig[];
}

interface NewColumnMapping {
  sheetColumn: string;
  metricKey: string;
  dataType: DataType;
  displayName: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DATA_CATEGORIES: { value: DataCategory; label: string }[] = [
  { value: "AD_METRICS", label: "Ad Metrics" },
  { value: "LEADS", label: "Leads" },
  { value: "SALES", label: "Sales" },
  { value: "CUSTOM", label: "Custom" },
];

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: "NUMBER", label: "Number" },
  { value: "CURRENCY", label: "Currency" },
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "TEXT", label: "Text" },
  { value: "DATE", label: "Date" },
];

const WIDGET_TYPES: { value: WidgetType; label: string }[] = [
  { value: "KPI_CARD", label: "KPI Card" },
  { value: "LINE_CHART", label: "Line Chart" },
  { value: "BAR_CHART", label: "Bar Chart" },
  { value: "FUNNEL", label: "Funnel" },
  { value: "DATA_TABLE", label: "Data Table" },
  { value: "COMPARISON_CARD", label: "Comparison Card" },
];

// ─── Styles ─────────────────────────────────────────────────────────────────

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const primaryBtnClass =
  "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 transition-colors";

const secondaryBtnClass =
  "inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors";

const destructiveBtnClass =
  "inline-flex items-center rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors";

const cardClass = "rounded-xl border bg-card p-6 shadow-sm";

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// ─── Page Component ─────────────────────────────────────────────────────────

type TabId = "general" | "data-sources" | "widgets";

export default function ClientEditPage() {
  const params = useParams();
  const { toast } = useToast();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("general");

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/clients/${clientId}`);
    if (res.ok) {
      setClient(await res.json());
    } else {
      toast("Failed to load client", "destructive");
    }
    setLoading(false);
  }, [clientId, toast]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-10 w-72 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to clients
        </Link>
        <div className={cardClass}>
          <p className="text-muted-foreground">Client not found.</p>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "general", label: "General" },
    { id: "data-sources", label: "Data Sources" },
    { id: "widgets", label: "Dashboard Widgets" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clients"
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
          <p className="text-muted-foreground">
            /{client.slug}
            {!client.isActive && (
              <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                Inactive
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <GeneralTab client={client} onUpdate={fetchClient} />
      )}
      {activeTab === "data-sources" && (
        <DataSourcesTab
          clientId={clientId}
          sheetConfigs={client.sheetConfigs}
          onUpdate={fetchClient}
        />
      )}
      {activeTab === "widgets" && (
        <WidgetsTab
          clientId={clientId}
          widgets={client.widgetConfigs}
          onUpdate={fetchClient}
        />
      )}
    </div>
  );
}

// ─── General Tab ────────────────────────────────────────────────────────────

function GeneralTab({
  client,
  onUpdate,
}: {
  client: ClientData;
  onUpdate: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(client.name);
  const [slug, setSlug] = useState(client.slug);
  const [isActive, setIsActive] = useState(client.isActive);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, isActive }),
    });

    if (res.ok) {
      toast("Client updated", "success");
      await onUpdate();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to update client", "destructive");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6">
      <div className={`${cardClass} space-y-4`}>
        <h3 className="font-semibold">Client Details</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">Client Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="e.g., Joe's Gym"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">URL Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            className={inputClass}
            placeholder="e.g., joes-gym"
            required
          />
          <p className="text-xs text-muted-foreground">
            Used in the dashboard URL: /dashboard/{slug}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active
          </label>
          <span className="text-xs text-muted-foreground">
            Inactive clients cannot access their dashboard
          </span>
        </div>
      </div>

      {client.user && (
        <div className={`${cardClass} space-y-4`}>
          <h3 className="font-semibold">Login Credentials</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={client.user.username}
              disabled
              className={`${inputClass} bg-muted cursor-not-allowed`}
            />
            <p className="text-xs text-muted-foreground">
              Username editing is not yet available
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={primaryBtnClass}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <Link href="/admin/clients" className={secondaryBtnClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

// ─── Data Sources Tab ───────────────────────────────────────────────────────

function DataSourcesTab({
  clientId,
  sheetConfigs,
  onUpdate,
}: {
  clientId: string;
  sheetConfigs: SheetConfig[];
  onUpdate: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(configId: string) {
    if (!confirm("Delete this data source? Associated cached data may be affected."))
      return;

    setDeleting(configId);
    const res = await fetch(
      `/api/clients/${clientId}/sheets?id=${configId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      toast("Data source deleted", "success");
      await onUpdate();
    } else {
      toast("Failed to delete data source", "destructive");
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      {/* Existing Sources */}
      {sheetConfigs.length > 0 ? (
        <div className="space-y-4">
          {sheetConfigs.map((config) => (
            <div key={config.id} className={cardClass}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium">{config.tabName}</h4>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {config.dataCategory.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {config.spreadsheetUrl || config.spreadsheetId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Date column: {config.dateColumn} -- {config.columnMappings.length}{" "}
                    mapped column{config.columnMappings.length !== 1 ? "s" : ""}
                  </p>
                  {config.columnMappings.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {config.columnMappings.map((col) => (
                        <span
                          key={col.id}
                          className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs"
                          title={`${col.sheetColumn} -> ${col.metricKey} (${col.dataType})`}
                        >
                          {col.displayName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(config.id)}
                  disabled={deleting === config.id}
                  className={destructiveBtnClass}
                >
                  {deleting === config.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${cardClass} text-center py-8`}>
          <p className="text-muted-foreground">
            No data sources configured yet.
          </p>
        </div>
      )}

      {/* Add Form Toggle */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className={primaryBtnClass}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </button>
      ) : (
        <AddDataSourceForm
          clientId={clientId}
          onSaved={async () => {
            setShowAddForm(false);
            await onUpdate();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

// ─── Add Data Source Form ───────────────────────────────────────────────────

function AddDataSourceForm({
  clientId,
  onSaved,
  onCancel,
}: {
  clientId: string;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const { toast } = useToast();

  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectedTabs, setDetectedTabs] = useState<string[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("");
  const [dataCategory, setDataCategory] = useState<DataCategory>("AD_METRICS");
  const [dateColumn, setDateColumn] = useState("");
  const [columnMappings, setColumnMappings] = useState<NewColumnMapping[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleDetectTabs() {
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      toast("Invalid Google Sheet URL", "destructive");
      return;
    }

    setDetecting(true);
    try {
      const res = await fetch("/api/sheets/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setDetectedTabs(data.tabs || []);
        if (data.tabs?.length > 0) {
          setSelectedTab(data.tabs[0]);
        }
        toast("Tabs detected successfully", "success");
      } else {
        const err = await res.json();
        toast(err.error || "Failed to detect tabs", "destructive");
      }
    } catch {
      toast("Failed to connect to sheets API", "destructive");
    }
    setDetecting(false);
  }

  async function handleTabSelect(tab: string) {
    setSelectedTab(tab);
    setDetectedColumns([]);
    setColumnMappings([]);

    // Try to fetch column headers for the selected tab
    try {
      const res = await fetch("/api/sheets/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetUrl, tabName: tab }),
      });

      if (res.ok) {
        const data = await res.json();
        const cols: string[] = data.columns || data.headers || [];
        setDetectedColumns(cols);
        setColumnMappings(
          cols.map((col) => ({
            sheetColumn: col,
            metricKey: col
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_|_$/g, ""),
            dataType: "NUMBER" as DataType,
            displayName: col,
          }))
        );
      }
    } catch {
      // Columns will be added manually
    }
  }

  function updateMapping(index: number, updates: Partial<NewColumnMapping>) {
    setColumnMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...updates } : m))
    );
  }

  function removeMapping(index: number) {
    setColumnMappings((prev) => prev.filter((_, i) => i !== index));
  }

  function addMapping() {
    setColumnMappings((prev) => [
      ...prev,
      { sheetColumn: "", metricKey: "", dataType: "NUMBER", displayName: "" },
    ]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      toast("Invalid Google Sheet URL", "destructive");
      return;
    }
    if (!selectedTab) {
      toast("Please select a tab", "destructive");
      return;
    }
    if (!dateColumn.trim()) {
      toast("Date column is required", "destructive");
      return;
    }

    // Filter out mappings with empty required fields
    const validMappings = columnMappings.filter(
      (m) => m.sheetColumn.trim() && m.metricKey.trim()
    );

    setSaving(true);
    const res = await fetch(`/api/clients/${clientId}/sheets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spreadsheetId,
        spreadsheetUrl,
        tabName: selectedTab,
        dataCategory,
        dateColumn: dateColumn.trim(),
        columnMappings: validMappings,
      }),
    });

    if (res.ok) {
      toast("Data source added", "success");
      await onSaved();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to add data source", "destructive");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className={`${cardClass} space-y-6`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Add Data Source</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 hover:bg-accent rounded-md transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Sheet URL + Detect */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Google Sheet URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={spreadsheetUrl}
            onChange={(e) => setSpreadsheetUrl(e.target.value)}
            className={`${inputClass} flex-1`}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            required
          />
          <button
            type="button"
            onClick={handleDetectTabs}
            disabled={detecting || !spreadsheetUrl}
            className={secondaryBtnClass}
          >
            {detecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Detect Tabs
          </button>
        </div>
      </div>

      {/* Tab Selection */}
      {detectedTabs.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Tab</label>
          <div className="relative">
            <select
              value={selectedTab}
              onChange={(e) => handleTabSelect(e.target.value)}
              className={`${inputClass} appearance-none pr-10`}
            >
              {detectedTabs.map((tab) => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {/* Data Category */}
      {selectedTab && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Category</label>
          <div className="relative">
            <select
              value={dataCategory}
              onChange={(e) => setDataCategory(e.target.value as DataCategory)}
              className={`${inputClass} appearance-none pr-10`}
            >
              {DATA_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {/* Date Column */}
      {selectedTab && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Column</label>
          <input
            type="text"
            value={dateColumn}
            onChange={(e) => setDateColumn(e.target.value)}
            className={inputClass}
            placeholder="e.g., Date"
            required
          />
          <p className="text-xs text-muted-foreground">
            The column header that contains date values
          </p>
        </div>
      )}

      {/* Column Mappings */}
      {selectedTab && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Column Mappings</label>
            <button
              type="button"
              onClick={addMapping}
              className="inline-flex items-center text-xs text-primary hover:underline"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Column
            </button>
          </div>

          {columnMappings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No columns detected. Click &quot;Add Column&quot; to add manually, or
              select a tab to auto-detect.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Header row - hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_120px_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Sheet Column</span>
                <span>Metric Key</span>
                <span>Display Name</span>
                <span>Data Type</span>
                <span />
              </div>

              {columnMappings.map((mapping, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_120px_40px] gap-2 p-3 md:p-0 rounded-md md:rounded-none border md:border-0 bg-muted/30 md:bg-transparent"
                >
                  <div>
                    <label className="text-xs text-muted-foreground md:hidden mb-1 block">
                      Sheet Column
                    </label>
                    <input
                      type="text"
                      value={mapping.sheetColumn}
                      onChange={(e) =>
                        updateMapping(index, { sheetColumn: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Column header"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground md:hidden mb-1 block">
                      Metric Key
                    </label>
                    <input
                      type="text"
                      value={mapping.metricKey}
                      onChange={(e) =>
                        updateMapping(index, { metricKey: e.target.value })
                      }
                      className={inputClass}
                      placeholder="metric_key"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground md:hidden mb-1 block">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={mapping.displayName}
                      onChange={(e) =>
                        updateMapping(index, { displayName: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Display Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground md:hidden mb-1 block">
                      Data Type
                    </label>
                    <div className="relative">
                      <select
                        value={mapping.dataType}
                        onChange={(e) =>
                          updateMapping(index, {
                            dataType: e.target.value as DataType,
                          })
                        }
                        className={`${inputClass} appearance-none pr-8`}
                      >
                        {DATA_TYPES.map((dt) => (
                          <option key={dt.value} value={dt.value}>
                            {dt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-end md:items-center justify-end md:justify-start">
                    <button
                      type="button"
                      onClick={() => removeMapping(index)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove column"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t">
        <button type="submit" disabled={saving || !selectedTab} className={primaryBtnClass}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Data Source"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtnClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Widgets Tab ────────────────────────────────────────────────────────────

function WidgetsTab({
  clientId,
  widgets,
  onUpdate,
}: {
  clientId: string;
  widgets: WidgetConfig[];
  onUpdate: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(widgetId: string) {
    if (!confirm("Delete this widget?")) return;

    setDeleting(widgetId);
    const res = await fetch(
      `/api/clients/${clientId}/widgets?id=${widgetId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      toast("Widget deleted", "success");
      await onUpdate();
    } else {
      toast("Failed to delete widget", "destructive");
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      {/* Existing Widgets */}
      {widgets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <div key={widget.id} className={cardClass}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium truncate">{widget.title}</h4>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 mt-1">
                    {widget.widgetType.replace(/_/g, " ")}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(widget.id)}
                  disabled={deleting === widget.id}
                  className={destructiveBtnClass}
                >
                  {deleting === widget.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground">
                    Position
                  </span>
                  {widget.position}
                </div>
                <div>
                  <span className="block font-medium text-foreground">
                    Width
                  </span>
                  {widget.gridWidth}/12
                </div>
                <div>
                  <span className="block font-medium text-foreground">
                    Height
                  </span>
                  {widget.gridHeight}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${cardClass} text-center py-8`}>
          <p className="text-muted-foreground">
            No widgets configured yet.
          </p>
        </div>
      )}

      {/* Add Form Toggle */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className={primaryBtnClass}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </button>
      ) : (
        <AddWidgetForm
          clientId={clientId}
          nextPosition={
            widgets.length > 0
              ? Math.max(...widgets.map((w) => w.position)) + 1
              : 0
          }
          onSaved={async () => {
            setShowAddForm(false);
            await onUpdate();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

// ─── Add Widget Form ────────────────────────────────────────────────────────

function AddWidgetForm({
  clientId,
  nextPosition,
  onSaved,
  onCancel,
}: {
  clientId: string;
  nextPosition: number;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const { toast } = useToast();

  const [widgetType, setWidgetType] = useState<WidgetType>("KPI_CARD");
  const [title, setTitle] = useState("");
  const [gridWidth, setGridWidth] = useState(6);
  const [configJson, setConfigJson] = useState("{}");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    let parsedConfig: Record<string, unknown>;
    try {
      parsedConfig = JSON.parse(configJson);
    } catch {
      toast("Invalid JSON in config", "destructive");
      return;
    }

    if (!title.trim()) {
      toast("Title is required", "destructive");
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/clients/${clientId}/widgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widgetType,
        title: title.trim(),
        position: nextPosition,
        gridWidth,
        gridHeight: 1,
        config: parsedConfig,
      }),
    });

    if (res.ok) {
      toast("Widget added", "success");
      await onSaved();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to add widget", "destructive");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className={`${cardClass} space-y-6 max-w-2xl`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Add Widget</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 hover:bg-accent rounded-md transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Widget Type</label>
          <div className="relative">
            <select
              value={widgetType}
              onChange={(e) => setWidgetType(e.target.value as WidgetType)}
              className={`${inputClass} appearance-none pr-10`}
            >
              {WIDGET_TYPES.map((wt) => (
                <option key={wt.value} value={wt.value}>
                  {wt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g., Total Ad Spend"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Grid Width{" "}
          <span className="text-muted-foreground font-normal">
            (1-12, default 6)
          </span>
        </label>
        <input
          type="number"
          min={1}
          max={12}
          value={gridWidth}
          onChange={(e) =>
            setGridWidth(
              Math.min(12, Math.max(1, parseInt(e.target.value) || 6))
            )
          }
          className={`${inputClass} max-w-[120px]`}
        />
        <div className="mt-2 h-3 w-full rounded bg-muted overflow-hidden">
          <div
            className="h-full rounded bg-primary/30 transition-all"
            style={{ width: `${(gridWidth / 12) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Config JSON{" "}
          <span className="text-muted-foreground font-normal">
            (will be replaced with proper UI later)
          </span>
        </label>
        <textarea
          value={configJson}
          onChange={(e) => setConfigJson(e.target.value)}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px] resize-y"
          placeholder='{"metricKey": "ad_spend", "format": "currency"}'
        />
      </div>

      <div className="flex gap-3 pt-2 border-t">
        <button type="submit" disabled={saving} className={primaryBtnClass}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Widget"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtnClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}
