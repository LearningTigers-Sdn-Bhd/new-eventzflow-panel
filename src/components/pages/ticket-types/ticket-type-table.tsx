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
import type { TicketType } from "@/lib/api/ticket-type";
import { generateColumns } from "./ticket-type-columns";
import { TicketTypeItem } from "./ticket-type-item";
import { DataControl } from "./ticket-type-table-control";

interface DataTableProps {
	data: TicketType[];
}

export function DataTable({ data }: DataTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo(() => generateColumns(), []);

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
		state: { sorting, columnFilters, columnVisibility },
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
								title: "No ticket types found",
								desc: "Create your first ticket type to get started",
								icon: <Ticket />,
								action: <Button>Create Ticket Type</Button>,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<TicketTypeItem key={row.id} ticketType={row.original} />
									))
							) : (
								<EmptyState
									title="No ticket types found"
									description="Create your first ticket type to get started"
									icon={<Ticket />}
									height="h-auto"
									action={<Button>Create Ticket Type</Button>}
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<TicketTypeItem ticketType={row.original} />
									</div>
								))
							) : (
								<EmptyState
									title="No ticket types found"
									description="Create your first ticket type to get started"
									icon={<Ticket />}
									height="h-auto"
									action={<Button>Create Ticket Type</Button>}
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
