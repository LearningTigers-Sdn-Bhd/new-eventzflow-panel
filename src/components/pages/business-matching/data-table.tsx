"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Briefcase } from "lucide-react";
import * as React from "react";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { QuerySearchField } from "@/components/query-search-field";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useIsTablet } from "@/hooks/use-tablet";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import { BusinessMatchingItem } from "./business-matching-item";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	actions?: React.ReactNode; // Add actions prop
}

export function DataTable<TData, TValue>({
	columns,
	data,
	actions,
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
			<div className="mb-4 flex flex-col border border-dashed bg-transparent px-0 py-0 md:px-2 md:py-4 lg:bg-accent lg:px-4 lg:py-4">
				<div className="flex items-center gap-2">
					<QuerySearchField
						table={table}
						columns={["title"]}
						placeholder="Filter events..."
						searchCustomFields={false}
					/>
					{actions && <div className="ml-auto shrink-0">{actions}</div>}
				</div>
			</div>

			{/* Data Table */}
			{!isTablet ? (
				<div className="rounded-none border border-dashed">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<EmptyState
											title="No events found"
											description="Business matching events will appear here."
											icon={<Briefcase />}
											height="h-auto"
										/>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			) : (
				<div className="mt-4 space-y-2">
					{table.getRowModel().rows?.length ? (
						table
							.getRowModel()
							.rows.map((row) => (
								<BusinessMatchingItem
									key={row.id}
									event={row.original as BusinessMatchingEvent}
								/>
							))
					) : (
						<EmptyState
							title="No events found"
							description="Business matching events will appear here."
							icon={<Briefcase />}
							height="h-auto"
						/>
					)}
				</div>
			)}
			<DataPagination table={table} />
		</div>
	);
}
