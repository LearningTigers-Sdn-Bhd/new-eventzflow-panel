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
import { Package } from "lucide-react";
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
import type { Vendor } from "@/lib/api/vendor";
import { VendorItem } from "./vendor-item";
import { generateColumns } from "./vendors-table-columns";
import { DataControl } from "./vendors-table-control";

interface DataTableProps<TData> {
	data: TData[];
	onAddVendor?: () => void;
}

export function DataTable<TData>({ data, onAddVendor }: DataTableProps<TData>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
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
			{/* Control Panel */}
			<DataControl table={table} />

			<div className="min-h-[65vh]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No vendors found",
								desc: "Add your first vendor to get started",
								icon: <Package />,
								action: onAddVendor ? (
									<Button onClick={onAddVendor}>Add Vendor</Button>
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
										<VendorItem key={row.id} vendor={row.original as Vendor} />
									))
							) : (
								<EmptyState
									title="No vendors found"
									description="Add your first vendor to get started"
									icon={<Package />}
									height="h-auto"
									action={
										onAddVendor && (
											<Button onClick={onAddVendor}>Add Vendor</Button>
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
										<VendorItem vendor={row.original as Vendor} />
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No vendors found"
										description="Add your first vendor to get started"
										icon={<Package />}
										height="h-auto"
										action={
											onAddVendor && (
												<Button onClick={onAddVendor}>Add Vendor</Button>
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
