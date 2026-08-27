"use client";

import {
	type ColumnDef,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { EmptyState } from "@/components/data-state";
import type { ScannedLog } from "@/lib/api/event/scan-log/response";
import { ScannedLogItem } from "./ticket-scanned-log-item";
import { DataControl } from "./ticket-scanned-log-table-control";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	search: string;
	onSearchChange: (value: string) => void;
	source: string;
	onSourceChange: (value: string) => void;
	onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	search,
	onSearchChange,
	source,
	onSourceChange,
	onRowClick,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	// No pagination row model: search, the source filter, and paging are all
	// server-driven (page.tsx), so `data` here is already exactly one page.
	// Registering getPaginationRowModel would silently slice that page again
	// to TanStack's default page size (10) everywhere table.getRowModel() is
	// read below — desktop, mobile, and tablet all lose rows past the 10th.
	// Sorting stays local: it only reorders the rows already on this page.
	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnVisibility,
		},
	});

	return (
		<div className="w-full">
			<DataControl
				table={table}
				search={search}
				onSearchChange={onSearchChange}
				source={source}
				onSourceChange={onSourceChange}
			/>

			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							clickableRowConfig={
								onRowClick ? { isEnabled: true, onRowClick } : undefined
							}
							emptyStateConfig={{
								title: "No scanned logs found",
								desc: "No scan logs available for this event yet",
								icon: <Calendar />,
							}}
						/>
					</DesktopView>
					<MobileView>
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
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<ScannedLogItem scannedLog={row.original as ScannedLog} />
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No scanned logs found"
										description="No scan logs available for this event yet"
										icon={<Calendar />}
										height="h-auto"
									/>
								</div>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
		</div>
	);
}
