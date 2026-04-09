"use client";

import { useState } from "react";
import {
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  {
    label: "Last 7 days",
    getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "Last 30 days",
    getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "This week",
    getRange: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: new Date(),
    }),
  },
  {
    label: "Last week",
    getRange: () => ({
      from: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      to: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "This month",
    getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }),
  },
  {
    label: "Last month",
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "Last 90 days",
    getRange: () => ({ from: subDays(new Date(), 89), to: new Date() }),
  },
];

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [activePreset, setActivePreset] = useState("Last 30 days");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => {
            setActivePreset(preset.label);
            setShowCustom(false);
            onChange(preset.getRange());
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            activePreset === preset.label && !showCustom
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground hover:bg-accent"
          }`}
        >
          {preset.label}
        </button>
      ))}
      <button
        onClick={() => {
          setShowCustom(true);
          setActivePreset("");
        }}
        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
          showCustom
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-foreground hover:bg-accent"
        }`}
      >
        Custom
      </button>

      {showCustom && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={format(value.from, "yyyy-MM-dd")}
            onChange={(e) =>
              onChange({ ...value, from: new Date(e.target.value + "T00:00:00") })
            }
            className="h-8 px-2 text-xs border rounded-md bg-background"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={format(value.to, "yyyy-MM-dd")}
            onChange={(e) =>
              onChange({ ...value, to: new Date(e.target.value + "T00:00:00") })
            }
            className="h-8 px-2 text-xs border rounded-md bg-background"
          />
        </div>
      )}
    </div>
  );
}
