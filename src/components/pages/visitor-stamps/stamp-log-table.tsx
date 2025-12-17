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
import { useResponsiveDeterminer } from "@/hooks/use-responsive-determiner";
import type { VisitorStampWithDetails } from "@/lib/api/visitor-stamp";
import { VisitorStampItem } from "./stamp-log-item";
import { generateColumns } from "./stamp-log-table-columns";
import { DataControl } from "./stamp-log-table-control";

interface DataTableProps<TData> {
	data: TData[];
}

export function DataTable<TData>({ data }: DataTableProps<TData>) {
	const { isMobile, isDesktop } = useResponsiveDeterminer();

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

			{/* Data Table */}
			<div className="flex min-h-[calc(100vh-320px)] flex-col">
				{isDesktop ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No visitor stamps found",
							desc: "No visitor stamp records available yet",
							icon: <Users />,
						}}
					/>
				) : isMobile ? (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<VisitorStampItem
										key={row.id}
										stamp={row.original as VisitorStampWithDetails}
									/>
								))
						) : (
							<EmptyState
								title="No visitor stamps found"
								description="No visitor stamp records available yet"
								icon={<Users />}
								height="h-auto"
							/>
						)}
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<div key={row.id} className="col-span-1">
									<VisitorStampItem
										stamp={row.original as VisitorStampWithDetails}
									/>
								</div>
							))
						) : (
							<EmptyState
								title="No visitor stamps found"
								description="No visitor stamp records available yet"
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
