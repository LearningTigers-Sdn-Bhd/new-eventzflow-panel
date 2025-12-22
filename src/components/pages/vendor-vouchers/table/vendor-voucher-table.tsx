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
import { Ticket } from "lucide-react";
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
import type { VendorVoucher } from "./vendor-voucher-table-columns";
import { generateColumns } from "./vendor-voucher-table-columns";
import { DataControl } from "./vendor-voucher-table-control";
import { VendorVoucherItem } from "./voucher-item";

interface VendorVoucherTableProps<TData> {
	data: TData[];
}

export function VendorVoucherTable<TData>({
	data,
}: VendorVoucherTableProps<TData>) {
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
			<DataControl table={table} />

			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No vouchers yet",
								desc: "Create your first voucher to start offering discounts",
								icon: <Ticket />,
								action: <Button>Create Voucher</Button>,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<VendorVoucherItem
											key={row.id}
											voucher={row.original as VendorVoucher}
										/>
									))
							) : (
								<EmptyState
									title="No vouchers yet"
									description="Create your first voucher to start offering discounts"
									icon={<Ticket />}
									height="h-auto"
									action={<Button>Create Voucher</Button>}
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<VendorVoucherItem
											voucher={row.original as VendorVoucher}
										/>
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No vouchers yet"
										description="Create your first voucher to start offering discounts"
										icon={<Ticket />}
										height="h-auto"
										action={<Button>Create Voucher</Button>}
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
