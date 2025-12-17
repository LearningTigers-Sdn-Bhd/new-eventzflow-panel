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
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import type { Visitor } from "@/lib/api/visitor";
import { generateColumns } from "./event-visitor-table-columns";
import { DataControl } from "./event-visitor-table-control";
import { VisitorItem } from "./event-visitor-item";

interface DataTableProps {
	eventId: number;
	data: Visitor[];
}

export function VisitorsDataTable({ eventId, data }: DataTableProps) {
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			phone: false, // Hide phone column by default
		});

	const columns = React.useMemo(() => generateColumns(), []);

	const table = useReactTable({
		data,
		columns: columns as ColumnDef<Visitor>[],
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
			<DataControl table={table} eventId={eventId} />

			{/* Data Table */}
			<div className="flex min-h-[calc(100vh-320px)] flex-col">
				{!isMobile && !isTablet ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No visitors found",
							desc: "Add your first visitor to get started",
							icon: <Users />,
						}}
					/>
				) : isTablet && !isMobile ? (
					<div className="grid grid-cols-2 gap-4">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<div key={row.id} className="col-span-1">
									<VisitorItem visitor={row.original as Visitor} />
								</div>
							))
						) : (
							<EmptyState
								title="No visitors found"
								description="Add your first visitor to get started"
								icon={<Users />}
								height="h-auto"
							/>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<VisitorItem key={row.id} visitor={row.original as Visitor} />
								))
						) : (
							<EmptyState
								title="No visitors found"
								description="Add your first visitor to get started"
								icon={<Users />}
								height="h-auto"
							/>
						)}
					</div>
				)}
			</div>
			<DataPagination table={table} />
		</div>
	);
}
