"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Handshake } from "lucide-react";
import * as React from "react";
import {
  DesktopView,
  MobileView,
  ResponsiveLayout,
  TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import type { Sponsor } from "@/lib/api/sponsorship/response";
import { generateColumns } from "./sponsors-table-columns";
import { DataControl } from "./sponsors-table-control";
import { SponsorItem } from "./sponsor-item";

interface DataTableProps<TData> {
  data: TData[];
  onAddSponsor?: () => void;
}

export function DataTable<TData>({ data, onAddSponsor }: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columns = React.useMemo(() => generateColumns() as ColumnDef<TData>[], []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      {/* Control Panel */}
      <DataControl table={table} />

      <div className="min-h-[65vh]">
        <ResponsiveLayout>
          <DesktopView>
            <BaseTable
              table={table}
              emptyStateConfig={{
                title: "No sponsors found",
                desc: "Add your first sponsor to get started",
                icon: <Handshake />,
                action: onAddSponsor ? (
                  <Button onClick={onAddSponsor}>Add Sponsor</Button>
                ) : undefined,
              }}
            />
          </DesktopView>
          <MobileView>
            <div className="space-y-2">
              {table.getRowModel().rows?.length ? (
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <SponsorItem key={row.id} sponsor={row.original as Sponsor} />
                  ))
              ) : (
                <EmptyState
                  title="No sponsors found"
                  description="Add your first sponsor to get started"
                  icon={<Handshake />}
                  height="h-auto"
                  action={
                    onAddSponsor && (
                      <Button onClick={onAddSponsor}>Add Sponsor</Button>
                    )
                  }
                />
              )}
            </div>
          </MobileView>
          <TabletView>
            <div className="grid grid-cols-2 gap-4">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <div key={row.id} className="col-span-1">
                    <SponsorItem sponsor={row.original as Sponsor} />
                  </div>
                ))
              ) : (
                <div className="col-span-2">
                  <EmptyState
                    title="No sponsors found"
                    description="Add your first sponsor to get started"
                    icon={<Handshake />}
                    height="h-auto"
                    action={
                      onAddSponsor && (
                        <Button onClick={onAddSponsor}>Add Sponsor</Button>
                      )
                    }
                  />
                </div>
              )}
            </div>
          </TabletView>
        </ResponsiveLayout>
      </div>

      {/* Pagination */}
      <DataPagination table={table} />
    </div>
  );
}
