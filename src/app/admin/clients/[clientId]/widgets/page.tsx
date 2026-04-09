"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, GripVertical, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Widget {
  id: string;
  widgetType: string;
  title: string;
  position: number;
  gridWidth: number;
  config: Record<string, unknown>;
}

const WIDGET_TYPES = [
  { value: "KPI_CARD", label: "KPI Card", defaultWidth: 3 },
  { value: "LINE_CHART", label: "Line Chart", defaultWidth: 6 },
  { value: "BAR_CHART", label: "Bar Chart", defaultWidth: 6 },
  { value: "FUNNEL", label: "Funnel", defaultWidth: 6 },
  { value: "DATA_TABLE", label: "Data Table", defaultWidth: 12 },
  { value: "COMPARISON_CARD", label: "Comparison Card", defaultWidth: 3 },
];

const CONFIG_TEMPLATES: Record<string, Record<string, unknown>> = {
  KPI_CARD: { metricKey: "amount_spent", format: "currency" },
  LINE_CHART: {
    metrics: [
      { key: "amount_spent", label: "Spend", color: "#3b82f6", format: "currency" },
    ],
  },
  BAR_CHART: {
    metrics: [
      { key: "lead_count", label: "Leads", color: "#10b981", format: "number" },
    ],
  },
  FUNNEL: {
    stages: [
      { metricKey: "impressions", label: "Impressions", color: "#6366f1" },
      { metricKey: "link_clicks", label: "Clicks", color: "#3b82f6" },
      { metricKey: "lead_count", label: "Leads", color: "#10b981" },
    ],
  },
  DATA_TABLE: {
    columns: [
      { key: "amount_spent", label: "Spend", format: "currency" },
      { key: "impressions", label: "Impressions", format: "number" },
      { key: "link_clicks", label: "Clicks", format: "number" },
      { key: "lead_count", label: "Leads", format: "number" },
      { key: "cost_per_lead", label: "CPL", format: "currency" },
    ],
    pageSize: 25,
  },
  COMPARISON_CARD: { metricKey: "lead_count", format: "number" },
};

export default function WidgetsPage() {
  const { clientId } = useParams();
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState("KPI_CARD");
  const [newTitle, setNewTitle] = useState("");
  const [newWidth, setNewWidth] = useState(3);
  const [newConfig, setNewConfig] = useState(
    JSON.stringify(CONFIG_TEMPLATES.KPI_CARD, null, 2)
  );

  useEffect(() => {
    fetchWidgets();
  }, [clientId]);

  async function fetchWidgets() {
    const res = await fetch(`/api/clients/${clientId}/widgets`);
    if (res.ok) setWidgets(await res.json());
    setLoading(false);
  }

  async function addWidget() {
    let config;
    try {
      config = JSON.parse(newConfig);
    } catch {
      toast("Invalid JSON configuration", "destructive");
      return;
    }

    const res = await fetch(`/api/clients/${clientId}/widgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widgetType: newType,
        title: newTitle,
        position: widgets.length,
        gridWidth: newWidth,
        config,
      }),
    });

    if (res.ok) {
      toast("Widget added", "success");
      setShowAdd(false);
      setNewTitle("");
      fetchWidgets();
    } else {
      toast("Failed to add widget", "destructive");
    }
  }

  async function deleteWidget(id: string) {
    const res = await fetch(`/api/clients/${clientId}/widgets?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast("Widget deleted", "success");
      fetchWidgets();
    }
  }

  async function moveWidget(id: string, direction: "up" | "down") {
    const idx = widgets.findIndex((w) => w.id === id);
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === widgets.length - 1)
    )
      return;

    const newWidgets = [...widgets];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newWidgets[idx], newWidgets[swapIdx]] = [
      newWidgets[swapIdx],
      newWidgets[idx],
    ];

    const updates = newWidgets.map((w, i) => ({
      id: w.id,
      position: i,
    }));

    await fetch(`/api/clients/${clientId}/widgets`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgets: updates }),
    });

    fetchWidgets();
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
          <h2 className="text-2xl font-bold tracking-tight">
            Dashboard Widgets
          </h2>
          <p className="text-muted-foreground">
            Configure what appears on this client&apos;s dashboard.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </button>
      </div>

      {/* Existing widgets */}
      <div className="space-y-3">
        {widgets.map((widget, index) => (
          <div
            key={widget.id}
            className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-4"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveWidget(widget.id, "up")}
                disabled={index === 0}
                className="p-1 hover:bg-accent rounded disabled:opacity-30 transition-colors"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => moveWidget(widget.id, "down")}
                disabled={index === widgets.length - 1}
                className="p-1 hover:bg-accent rounded disabled:opacity-30 transition-colors"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {widget.widgetType.replace("_", " ")}
                </span>
                <span className="font-medium truncate">{widget.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Width: {widget.gridWidth}/12
              </p>
            </div>
            <button
              onClick={() => deleteWidget(widget.id)}
              className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {widgets.length === 0 && !showAdd && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No widgets configured yet.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Widget
          </button>
        </div>
      )}

      {/* Add widget form */}
      {showAdd && (
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">Add Widget</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Widget Type</label>
              <select
                value={newType}
                onChange={(e) => {
                  setNewType(e.target.value);
                  const wt = WIDGET_TYPES.find(
                    (t) => t.value === e.target.value
                  );
                  setNewWidth(wt?.defaultWidth || 6);
                  setNewConfig(
                    JSON.stringify(
                      CONFIG_TEMPLATES[e.target.value] || {},
                      null,
                      2
                    )
                  );
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {WIDGET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g., Total Spend"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Grid Width (1-12 columns)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={newWidth}
                onChange={(e) => setNewWidth(parseInt(e.target.value) || 6)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Configuration (JSON)
            </label>
            <textarea
              value={newConfig}
              onChange={(e) => setNewConfig(e.target.value)}
              rows={8}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={addWidget}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Add Widget
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview link */}
      {widgets.length > 0 && (
        <div className="text-center">
          <Link
            href={`/admin/clients/${clientId}/preview`}
            className="text-sm text-primary hover:underline"
          >
            Preview this dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
