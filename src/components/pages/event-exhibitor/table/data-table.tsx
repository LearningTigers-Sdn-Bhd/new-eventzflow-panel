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
import { Building2 } from "lucide-react";
import Link from "next/link";
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
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import type { ExhibitorMember } from "./columns";
import { DataControl } from "./data-control";
import { ExhibitorItem } from "./exhibitor-item";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	canManageVendors?: boolean;
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
			<DataControl table={table} />

			<div className="min-h-[45vh]">
				{!isTablet ? (
					<div className="overflow-hidden rounded-none border">
						<Table className="w-full">
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead
													key={header.id}
													style={{ width: `${header.getSize()}px` }}
													className={cn(header.index === 0 && "ps-3")}
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
												title="No exhibitors assigned"
												description="Assign existing vendors as exhibitors to this event."
												icon={<Building2 />}
												height="h-auto"
												action={
													<Button variant="link" asChild className="p-0 h-auto">
														<Link href="/vendor">Go to Vendors page</Link>
													</Button>
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
									<ExhibitorItem
										key={row.id}
										exhibitor={row.original as ExhibitorMember}
									/>
								))
						) : (
							<EmptyState
								title="No exhibitors assigned"
								description="Assign existing vendors as exhibitors to this event."
								icon={<Building2 />}
								height="h-auto"
								action={
									<Button variant="link" asChild className="p-0 h-auto">
										<Link href="/vendor">Go to Vendors page</Link>
									</Button>
								}
							/>
						)}
					</div>
				)}
			</div>

			<DataPagination table={table} />
		</div>
	);
}
