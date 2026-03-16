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
import { MessageSquareHeart } from "lucide-react";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { useIsTablet } from "@/hooks/use-tablet";
import { WishesCardGrid } from "./wishes-card-grid";
import { DataControl } from "./wishes-table-control";

interface DataTableProps<TData> {
	columns: ColumnDef<TData>[];
	data: TData[];
	eventId: string;
}

export function DataTable<TData>({
	columns,
	data,
	eventId,
}: DataTableProps<TData>) {
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
			<DataControl table={table} />

			<div className="min-h-[calc(100vh-320px)]">
				{!isTablet ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No wishes yet",
							desc: "New guestbook messages will appear here.",
							icon: <MessageSquareHeart />,
						}}
					/>
				) : (
					<WishesCardGrid table={table} eventId={eventId} />
				)}
			</div>
			<div className="mt-4">
				<DataPagination table={table} />
			</div>
		</div>
	);
}
