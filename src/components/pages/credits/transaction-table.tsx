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
import { CreditCard, Filter } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { TransactionLog } from "@eventzflow-panel/api/routers/credits";
import { TransactionLogItem } from "./transaction-item";

interface TransactionTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function TransactionTable<TData, TValue>({
	columns,
	data,
}: TransactionTableProps<TData, TValue>) {
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

	const typeFilter = table.getColumn("type")?.getFilterValue() as
		| "purchase"
		| "refund"
		| "bonus"
		| undefined;

	return (
		<div className="w-full">
			{/* Control Panel */}
			<div className="flex items-center gap-2 py-4">
				<QuerySearchField
					table={table}
					columns={["description"]}
					placeholder="Search transactions..."
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="shrink-0">
							<Filter className="mr-2 size-4" />
							<span className="hidden sm:inline">
								{typeFilter
									? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)
									: "All Types"}
							</span>
							<span className="sm:hidden">Filter</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => table.getColumn("type")?.setFilterValue(undefined)}
						>
							All Types
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => table.getColumn("type")?.setFilterValue("purchase")}
						>
							Purchase Only
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => table.getColumn("type")?.setFilterValue("refund")}
						>
							Refund Only
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => table.getColumn("type")?.setFilterValue("bonus")}
						>
							Bonus Only
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
											title="No transactions found"
											description="Your transaction history is empty"
											icon={<CreditCard />}
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
								<TransactionLogItem
									key={row.id}
									log={row.original as TransactionLog}
								/>
							))
					) : (
						<EmptyState
							title="No transactions found"
							description="Your transaction history is empty"
							icon={<CreditCard />}
							height="h-auto"
						/>
					)}
				</div>
			)}

			<DataPagination table={table} />
		</div>
	);
}
