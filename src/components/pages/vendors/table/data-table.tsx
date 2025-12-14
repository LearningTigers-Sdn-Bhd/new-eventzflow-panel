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
import { Package } from "lucide-react";
import * as React from "react";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Vendor } from "@/lib/api/vendor";
import { cn } from "@/lib/utils";
import { DataControl } from "./data-control";
import { VendorItem } from "./vendor-item";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onAddVendor?: () => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onAddVendor,
}: DataTableProps<TData, TValue>) {
	const _isMobile = useIsMobile();
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

			<div className="min-h-[65vh]">
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
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				) : (
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
				)}
			</div>

			{/* Pagination */}
			<DataPagination table={table} />
		</div>
	);
}
