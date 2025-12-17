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
import { Users } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useIsTablet } from "@/hooks/use-tablet";
import { EventStaffItem } from "./event-staff-item";
import type { EventStaffMember } from "./event-staff-table-columns";
import { DataControl } from "./event-staff-table-control";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const isTablet = useIsTablet();
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
			{/* Control Panel */}
			<DataControl table={table} />

			{/* Data Table */}
			<div className="flex min-h-[calc(100vh-320px)] flex-col">
				{!isTablet ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No staff members assigned",
							desc: "Assign team members to this event. Need to add new team members first?",
							icon: <Users />,
							action: (
								<Button variant="link" asChild className="h-auto p-0">
									<Link href="/team">Go to Team page</Link>
								</Button>
							),
						}}
					/>
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<EventStaffItem
										key={row.id}
										member={row.original as EventStaffMember}
									/>
								))
						) : (
							<EmptyState
								title="No staff members assigned"
								description="Assign team members to this event. Need to add new team members first?"
								icon={<Users />}
								height="h-auto"
								action={
									<Button variant="link" asChild className="h-auto p-0">
										<Link href="/team">Go to Team page</Link>
									</Button>
								}
							/>
						)}
					</div>
				)}
			</div>

			{/* Pagination */}
			<DataPagination table={table} />
		</div>
	);
}
