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
import { MessageSquare, Filter } from "lucide-react";
import * as React from "react";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CreditDeduction } from "@/lib/api/credits";
import { cn } from "@/lib/utils";
import { DeductionItem } from "./deduction-item";

interface DeductionTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DeductionTable<TData, TValue>({
	columns,
	data,
}: DeductionTableProps<TData, TValue>) {
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

	const statusFilter = table.getColumn("status")?.getFilterValue() as
		| "sent"
		| "failed"
		| "pending"
		| undefined;

	return (
		<div className="w-full">
			{/* Control Panel */}
			<div className="flex items-center gap-2 py-4">
				<QuerySearchField
					table={table}
					columns={["event", "recipient"]}
					placeholder="Search deductions..."
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="shrink-0">
							<Filter className="mr-2 size-4" />
							<span className="hidden sm:inline">
								{statusFilter
									? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
									: "All Status"}
							</span>
							<span className="sm:hidden">Filter</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() =>
								table.getColumn("status")?.setFilterValue(undefined)
							}
						>
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => table.getColumn("status")?.setFilterValue("sent")}
						>
							Sent Only
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								table.getColumn("status")?.setFilterValue("failed")
							}
						>
							Failed Only
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								table.getColumn("status")?.setFilterValue("pending")
							}
						>
							Pending Only
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Data Table */}
			{!_isMobile ? (
				<div className="overflow-hidden rounded-md border">
					<Table className="w-full table-fixed">
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
										className="h-14"
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												style={{ width: `${cell.column.getSize()}px` }}
												className={cn(
													"py-3",
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
											title="No deductions found"
											description="No WhatsApp message credit deductions yet"
											icon={<MessageSquare />}
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
						table
							.getRowModel()
							.rows.map((row) => (
								<DeductionItem
									key={row.id}
									deduction={row.original as CreditDeduction}
								/>
							))
					) : (
						<EmptyState
							title="No deductions found"
							description="No WhatsApp message credit deductions yet"
							icon={<MessageSquare />}
							height="h-auto"
						/>
					)}
				</div>
			)}

			<DataPagination table={table} />
		</div>
	);
}
