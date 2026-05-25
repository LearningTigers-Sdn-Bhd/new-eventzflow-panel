"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsTablet } from "@/hooks/use-tablet";
import { DateRangeFilter, type DateRange } from "./date-range-filter";

interface ExportLogTableControlProps<TData> {
  table: Table<TData>;
}

export function ExportLogTableControl<TData>({
  table,
}: ExportLogTableControlProps<TData>) {
  const isTablet = useIsTablet();

  const getTypeFilterValue = () => {
    const typeFilter =
      (table.getColumn("type")?.getFilterValue() as string[]) ?? [];
    return typeFilter.length === 0 ? "all" : typeFilter[0];
  };

  const dateRange: DateRange =
    (table.getColumn("createdAt")?.getFilterValue() as DateRange) ?? {
      from: null,
      to: null,
    };

  const handleDateRangeChange = (range: DateRange) => {
    const column = table.getColumn("createdAt");
    column?.setFilterValue(
      range.from === null && range.to === null ? undefined : range,
    );
  };

  const typeFilterControl: ControlConfig = {
    label: "Type",
    columnId: "type",
    type: "filter",
    data: [
      { label: "All", value: "all" },
      { label: "Ticket List", value: "ticket-list" },
      { label: "Scan History", value: "scan_history" },
    ],
    customFilter: {
      value: getTypeFilterValue(),
      onChange: (value: string) => {
        const column = table.getColumn("type");
        column?.setFilterValue(value === "all" ? undefined : [value]);
      },
    },
  };

  const mobileControlConfigs: ControlConfig[] = [
    { ...typeFilterControl, topPriority: true },
    { label: "Export ID", columnId: "id", type: "sort" },
    { label: "Type", columnId: "type", type: "sort" },
    { label: "Created", columnId: "createdAt", type: "sort" },
  ];

  const visibleColumns = table
    .getAllColumns()
    .filter((col) => col.getCanHide());
  const visibleColumnCount = visibleColumns.filter((col) =>
    col.getIsVisible(),
  ).length;

  if (!isTablet) {
    return (
      <div className="mb-4 flex flex-col border border-dashed bg-transparent px-0 py-0 md:px-2 md:py-4 lg:bg-accent lg:px-4 lg:py-4">
        <div className="hidden items-center gap-2 lg:flex">
          <QuerySearchField
            table={table}
            placeholder="Search export logs..."
          />
          <Select
            value={typeFilterControl.customFilter!.value}
            onValueChange={typeFilterControl.customFilter!.onChange}
          >
            <SelectTrigger className="w-35 rounded-none bg-background font-medium">
              <div className="flex items-center gap-1 truncate text-sm">
                <span className="font-semibold">Type:</span>
                <SelectValue placeholder="All" className="truncate" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {typeFilterControl.data!.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="rounded-none">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-none">
                  {visibleColumnCount} columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none bg-background">
                {visibleColumns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="rounded-none capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BaseTableControl
      table={table}
      searchConfig={{
        searchConfig: {
          placeholder: "Search export logs...",
          enableCustomSearch: false,
        },
      }}
      desktopConfig={{ controlConfigs: [] }}
      mobileConfig={{ controlConfigs: mobileControlConfigs }}
    />
  );
}
