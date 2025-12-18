"use client";

import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Gift } from "lucide-react";
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
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { generateColumns } from "./draw-session-table-columns";
import { DataControl } from "./draw-session-table-control";
import { SessionItem } from "./session-item";

interface DataTableProps<TData> {
	data: TData[];
}

export function DataTable<TData>({ data }: DataTableProps<TData>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo(() => generateColumns() as any[], []);

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

			<div className="min-h-[45vh]">
				{/* Data Table */}
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No sessions found",
								desc: "Create your first lucky draw session to get started",
								icon: <Gift />,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-4">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<SessionItem
											key={row.id}
											session={row.original as LuckyDrawSession}
										/>
									))
							) : (
								<EmptyState
									title="No sessions found"
									description="Create your first lucky draw session to get started"
									icon={<Gift />}
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
										<SessionItem session={row.original as LuckyDrawSession} />
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No sessions found"
										description="Create your first lucky draw session to get started"
										icon={<Gift />}
										height="h-auto"
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
