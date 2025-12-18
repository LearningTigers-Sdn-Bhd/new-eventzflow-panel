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
import { Store } from "lucide-react";
import Link from "next/link";
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
import { EventVendorItem } from "./event-vendor-item";
import type { EventVendorMember } from "./event-vendor-table-columns";
import { DataControl } from "./event-vendor-table-control";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
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

			{/* Data Table */}
			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No vendors assigned",
								desc: "Assign existing vendors to this event. Need to create a new vendor first?",
								icon: <Store />,
								action: (
									<Button variant="link" asChild className="h-auto p-0">
										<Link href="/vendor">Go to Vendors page</Link>
									</Button>
								),
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<EventVendorItem
											key={row.id}
											vendor={row.original as EventVendorMember}
										/>
									))
							) : (
								<EmptyState
									title="No vendors assigned"
									description="Assign existing vendors to this event. Need to create a new vendor first?"
									icon={<Store />}
									height="h-auto"
									action={
										<Button variant="link" asChild className="h-auto p-0">
											<Link href="/vendor">Go to Vendors page</Link>
										</Button>
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
										<EventVendorItem
											vendor={row.original as EventVendorMember}
										/>
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No vendors assigned"
										description="Assign existing vendors to this event. Need to create a new vendor first?"
										icon={<Store />}
										height="h-auto"
										action={
											<Button variant="link" asChild className="h-auto p-0">
												<Link href="/vendor">Go to Vendors page</Link>
											</Button>
										}
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
