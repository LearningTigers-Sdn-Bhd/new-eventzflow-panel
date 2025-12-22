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
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
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
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No export logs found",
								desc: "No exports available for this event yet",
								icon: <FileDown />,
							}}
						/>
					</DesktopView>
					<MobileView>
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
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<ExportLogItem exportLog={row.original as ExportLogs} />
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No export logs found"
										description="No exports available for this event yet"
										icon={<FileDown />}
										height="h-auto"
									/>
								</div>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
