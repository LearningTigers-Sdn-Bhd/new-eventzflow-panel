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
	type TableMeta,
	useReactTable,
} from "@tanstack/react-table";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	emptyTitle: string;
	emptyDescription: string;
	emptyIcon: React.ReactNode;
	searchPlaceholder?: string;
	searchColumns?: string[];
	meta?: TableMeta<TData>;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	emptyTitle,
	emptyDescription,
	emptyIcon,
	searchPlaceholder = "Search...",
	searchColumns = ["name"],
	meta,
}: DataTableProps<TData, TValue>) {
	const _isMobile = useIsMobile();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
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
		state: {
			sorting,
			columnFilters,
		},
		meta,
	});

	return (
		<div className="w-full">
			{/* Search Control */}
			<div className="mb-4 flex flex-col gap-3 border-y border-dashed bg-accent px-2 py-4 sm:flex-row sm:items-center lg:px-4">
				<QuerySearchField
					table={table}
					columns={searchColumns}
					placeholder={searchPlaceholder}
				/>
			</div>

			<div className="min-h-[30vh]">
				{/* Data Table */}
				{!_isMobile ? (
					<div className="overflow-hidden rounded-none border-y border-dashed">
						<Table className="w-full">
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead
													key={header.id}
													style={{ width: `${header.getSize()}px` }}
													className={cn(
														header.index === 0 && "ps-3",
														"rounded-none",
													)}
												>
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
												<TableCell
													key={cell.id}
													style={{ width: `${cell.column.getSize()}px` }}
													className={cn(
														table.getVisibleLeafColumns()[0]?.id ===
															cell.column.id && "ps-4",
													)}
												>
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
												title={emptyTitle}
												description={emptyDescription}
												icon={emptyIcon}
												height="h-auto"
											/>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<div
									key={row.id}
									className="rounded-none border border-primary/20 bg-card p-4 shadow-sm"
								>
									{row.getVisibleCells().map((cell) => (
										<div key={cell.id} className="mb-2">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</div>
									))}
								</div>
							))
						) : (
							<EmptyState
								title={emptyTitle}
								description={emptyDescription}
								icon={emptyIcon}
								height="h-auto"
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
