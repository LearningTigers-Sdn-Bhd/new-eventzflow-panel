"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Receipt } from "lucide-react";
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
import type { RedemptionLog } from "@/lib/api/voucher-redemption-log";
import { generateColumns } from "./voucher-log-table-columns";
import { DataControl } from "./voucher-log-table-control";

interface DataTableProps<TData> {
	data: TData[];
}

export function DataTable<TData extends RedemptionLog>({
	data,
}: DataTableProps<TData>) {
	const [sorting, setSorting] = React.useState<SortingState>([
		{ id: "redemptionTimestamp", desc: true }, // Default sort by time descending
	]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo(
		() => generateColumns() as ColumnDef<TData>[],
		[],
	);

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

			{/* Data Table */}
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No redemption logs found",
								desc: "Redemption logs will appear here after vouchers are scanned",
								icon: <Receipt />,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div
										key={row.id}
										className="space-y-2 rounded-none border bg-card p-4"
									>
										{row.getVisibleCells().map((cell) => (
											<div key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</div>
										))}
									</div>
								))
							) : (
								<EmptyState
									title="No redemption logs found"
									description="Redemption logs will appear here after vouchers are scanned"
									icon={<Receipt />}
									height="h-auto"
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div
										key={row.id}
										className="col-span-1 space-y-2 rounded-none border bg-card p-4"
									>
										{row.getVisibleCells().map((cell) => (
											<div key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</div>
										))}
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No redemption logs found"
										description="Redemption logs will appear here after vouchers are scanned"
										icon={<Receipt />}
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
