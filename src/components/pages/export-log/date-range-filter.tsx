"use client";

import { CalendarIcon, Check, ChevronDown, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DateRange = { from: Date | null; to: Date | null };

type Preset = "all" | "today" | "last7" | "last30" | "custom";

export function isWithinDateRange(
  date: Date,
  from: Date | null,
  to: Date | null,
): boolean {
  if (from) {
    const fromStart = new Date(from);
    fromStart.setHours(0, 0, 0, 0);
    if (date < fromStart) return false;
  }
  if (to) {
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);
    if (date > toEnd) return false;
  }
  return true;
}

function getPresetRange(preset: Preset): DateRange {
  const now = new Date();
  if (preset === "today") {
    return { from: now, to: now };
  }
  if (preset === "last7") {
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    return { from, to: now };
  }
  if (preset === "last30") {
    const from = new Date(now);
    from.setDate(now.getDate() - 29);
    return { from, to: now };
  }
  return { from: null, to: null };
}

function toInputValue(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromInputValue(value: string): Date | null {
  if (!value) return null;
  return new Date(value + "T00:00:00");
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [preset, setPreset] = React.useState<Preset>("all");
  const [open, setOpen] = React.useState(false);

  const handlePresetSelect = (selected: Preset) => {
    setPreset(selected);
    if (selected !== "custom") {
      onChange(getPresetRange(selected));
      setOpen(false);
    }
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ from: fromInputValue(e.target.value), to: value.to });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ from: value.from, to: fromInputValue(e.target.value) });
  };

  const handleClear = () => {
    setPreset("all");
    onChange({ from: null, to: null });
    setOpen(false);
  };

  const hasFilter = value.from !== null || value.to !== null;

  const getLabel = () => {
    if (preset === "today") return "Today";
    if (preset === "last7") return "Last 7 days";
    if (preset === "last30") return "Last 30 days";
    if (preset === "custom" && (value.from || value.to)) {
      const from = value.from ? toInputValue(value.from) : "...";
      const to = value.to ? toInputValue(value.to) : "...";
      return `${from} – ${to}`;
    }
    return "All dates";
  };

  const presets: { value: Preset; label: string }[] = [
    { value: "all", label: "All dates" },
    { value: "today", label: "Today" },
    { value: "last7", label: "Last 7 days" },
    { value: "last30", label: "Last 30 days" },
    { value: "custom", label: "Custom range" },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div className="flex items-center">
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`rounded-none bg-background font-medium ${hasFilter ? "rounded-r-none border-r-0" : ""}`}
          >
            <CalendarIcon className="mr-1 size-4" />
            <span className="text-sm">
              <span className="font-semibold">Date:</span> {getLabel()}
            </span>
            <ChevronDown className="ml-1 size-3" />
          </Button>
        </DropdownMenuTrigger>
        {hasFilter && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-9 items-center border border-input bg-background px-2 hover:bg-accent"
            aria-label="Clear date filter"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      <DropdownMenuContent className="w-48 rounded-none" align="start">
        {presets.map((p) => (
          <DropdownMenuItem
            key={p.value}
            className="rounded-none"
            onSelect={(e) => {
              if (p.value === "custom") e.preventDefault();
              handlePresetSelect(p.value);
            }}
          >
            <Check
              className={`mr-2 size-4 ${preset === p.value ? "opacity-100" : "opacity-0"}`}
            />
            {p.label}
          </DropdownMenuItem>
        ))}
        {preset === "custom" && (
          <>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  From
                </label>
                <input
                  type="date"
                  value={toInputValue(value.from)}
                  onChange={handleFromChange}
                  className="w-full rounded-none border border-input bg-background px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  To
                </label>
                <input
                  type="date"
                  value={toInputValue(value.to)}
                  onChange={handleToChange}
                  className="w-full rounded-none border border-input bg-background px-2 py-1 text-sm"
                />
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
