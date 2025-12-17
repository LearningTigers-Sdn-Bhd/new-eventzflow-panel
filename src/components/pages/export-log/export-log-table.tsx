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
import { FileDown } from "lucide-react";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { useResponsiveDeterminer } from "@/hooks/use-responsive-determiner";
import type { ExportLogs } from "./export-log-table-columns";
import { getSearchableContent } from "./export-log-table-columns";
import { ExportLogTableControl } from "./export-log-table-control";
import { ExportLogItem } from "./log-item";

interface ExportLogTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function ExportLogTable<TData, TValue>({
	columns,
	data,
}: ExportLogTableProps<TData, TValue>) {
	const { isMobile, isDesktop } = useResponsiveDeterminer();

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

	// Set up custom global filter function for search using getSearchableContent
	React.useEffect(() => {
		table.options.globalFilterFn = (row, _columnId, filterValue) => {
			if (!filterValue) return true;
			const searchTerm = String(filterValue).toLowerCase();
			const searchableContent = getSearchableContent(
				row.original as ExportLogs,
			);
			return searchableContent.toLowerCase().includes(searchTerm);
		};
	}, [table]);

	return (
		<div className="w-full">
			<ExportLogTableControl table={table} />

			{/* Data Table */}
			<div className="flex min-h-[calc(100vh-320px)] flex-col">
				{isDesktop ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No export logs found",
							desc: "No exports available for this event yet",
							icon: <FileDown />,
						}}
					/>
				) : isMobile ? (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<ExportLogItem
										key={row.id}
										exportLog={row.original as ExportLogs}
									/>
								))
						) : (
							<EmptyState
								title="No export logs found"
								description="No exports available for this event yet"
								icon={<FileDown />}
								height="h-auto"
							/>
						)}
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<div key={row.id} className="col-span-1">
									<ExportLogItem exportLog={row.original as ExportLogs} />
								</div>
							))
						) : (
							<EmptyState
								title="No export logs found"
								description="No exports available for this event yet"
								icon={<FileDown />}
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
