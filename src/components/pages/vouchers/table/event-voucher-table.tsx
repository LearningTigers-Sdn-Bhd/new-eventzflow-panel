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
import { useParams } from "next/navigation";
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
import { useDialog } from "@/hooks/use-dialog";
import AddVoucherForm from "../forms/add-voucher-form";
import type { BaseVoucher } from "./event-voucher-table-columns";
import { DataControl } from "./event-voucher-table-control";
import { VoucherItem } from "./voucher-item";

interface DataTableProps<TData> {
	columns: ColumnDef<TData>[];
	data: TData[];
}

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();

	const handleAddVoucher = () => {
		openDialog({
			component: AddVoucherForm,
			props: {
				eventId: Number(eventId),
				onClose: closeDialog,
			},
			config: {
				title: "Create Voucher",
				description: "Create a new voucher for this event.",
				size: "full",
			},
		});
	};

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
								title: "No vouchers assigned",
								desc: "Add vouchers to this event to get started",
								icon: <Ticket />,
								action: <Button onClick={handleAddVoucher}>Add Voucher</Button>,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<VoucherItem
											key={row.id}
											voucher={row.original as BaseVoucher}
										/>
									))
							) : (
								<EmptyState
									title="No vouchers assigned"
									description="Add vouchers to this event to get started"
									icon={<Ticket />}
									height="h-auto"
									action={
										<Button onClick={handleAddVoucher}>Add Voucher</Button>
									}
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<VoucherItem
											key={row.id}
											voucher={row.original as BaseVoucher}
										/>
									))
							) : (
								<EmptyState
									title="No vouchers assigned"
									description="Add vouchers to this event to get started"
									icon={<Ticket />}
									height="h-auto"
									action={
										<Button onClick={handleAddVoucher}>Add Voucher</Button>
									}
								/>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
