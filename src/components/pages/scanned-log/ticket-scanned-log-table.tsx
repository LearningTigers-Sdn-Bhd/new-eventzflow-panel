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
import { Calendar } from "lucide-react";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import type { ScannedLog } from "./ticket-scanned-log-columns";
import { ScannedLogItem } from "./ticket-scanned-log-item";
import { DataControl } from "./ticket-scanned-log-table-control";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

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
			<DataControl table={table} />

			<div className="flex min-h-[calc(100vh-320px)] flex-col">
				{!isMobile && !isTablet ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No scanned logs found",
							desc: "No scan logs available for this event yet",
							icon: <Calendar />,
						}}
					/>
				) : isTablet && !isMobile ? (
					<div className="grid grid-cols-2 gap-4">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<div key={row.id} className="col-span-1">
									<ScannedLogItem scannedLog={row.original as ScannedLog} />
								</div>
							))
						) : (
							<EmptyState
								title="No scanned logs found"
								description="No scan logs available for this event yet"
								icon={<Calendar />}
								height="h-auto"
							/>
						)}
					</div>
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<ScannedLogItem
										key={row.id}
										scannedLog={row.original as ScannedLog}
									/>
								))
						) : (
							<EmptyState
								title="No scanned logs found"
								description="No scan logs available for this event yet"
								icon={<Calendar />}
								height="h-auto"
							/>
						)}
					</div>
				)}
			</div>

			<DataPagination table={table} />
		</div>
	);
}
