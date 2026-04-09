"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

type PresetKey = "7d" | "30d" | "this-month" | "last-month" | "custom"

const presets: { key: PresetKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "custom", label: "Custom" },
]

function getPresetRange(key: PresetKey): DateRange | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (key) {
    case "7d": {
      const from = new Date(today)
      from.setDate(from.getDate() - 6)
      return { from, to: today }
    }
    case "30d": {
      const from = new Date(today)
      from.setDate(from.getDate() - 29)
      return { from, to: today }
    }
    case "this-month": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from, to: today }
    }
    case "last-month": {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const to = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from, to }
    }
    case "custom":
      return null
  }
}

function detectActivePreset(value: DateRange): PresetKey {
  for (const preset of presets) {
    if (preset.key === "custom") continue
    const range = getPresetRange(preset.key)
    if (
      range &&
      formatDate(range.from) === formatDate(value.from) &&
      formatDate(range.to) === formatDate(value.to)
    ) {
      return preset.key
    }
  }
  return "custom"
}

function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = React.useState<PresetKey>(() =>
    detectActivePreset(value)
  )
  const [showCustom, setShowCustom] = React.useState(
    () => detectActivePreset(value) === "custom"
  )

  const handlePresetClick = (key: PresetKey) => {
    setActivePreset(key)
    if (key === "custom") {
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    const range = getPresetRange(key)
    if (range) {
      onChange(range)
    }
  }

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value + "T00:00:00")
    if (!isNaN(date.getTime())) {
      onChange({ from: date, to: value.to })
      setActivePreset("custom")
    }
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value + "T00:00:00")
    if (!isNaN(date.getTime())) {
      onChange({ from: value.from, to: date })
      setActivePreset("custom")
    }
  }

  return (
    <div
      data-slot="date-range-picker"
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarIcon className="size-4" />
        <span>
          {formatDisplayDate(value.from)} - {formatDisplayDate(value.to)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <Button
            key={preset.key}
            variant={activePreset === preset.key ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(preset.key)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="date-from"
              className="text-xs font-medium text-muted-foreground"
            >
              From
            </label>
            <input
              id="date-from"
              data-slot="date-input"
              type="date"
              value={formatDate(value.from)}
              onChange={handleFromChange}
              className="border-input bg-background h-9 rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>
          <div className="mt-5 text-sm text-muted-foreground">to</div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="date-to"
              className="text-xs font-medium text-muted-foreground"
            >
              To
            </label>
            <input
              id="date-to"
              data-slot="date-input"
              type="date"
              value={formatDate(value.to)}
              onChange={handleToChange}
              className="border-input bg-background h-9 rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export { DateRangePicker, type DateRange }
