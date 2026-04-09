"use client";

interface ComparisonToggleProps {
  value: string;
  onChange: (value: string) => void;
}

const options = [
  { value: "", label: "No comparison" },
  { value: "previous_period", label: "Previous period" },
  { value: "previous_week", label: "Previous week" },
  { value: "previous_month", label: "Previous month" },
];

export function ComparisonToggle({ value, onChange }: ComparisonToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Compare:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 px-2 text-xs border rounded-md bg-background"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
