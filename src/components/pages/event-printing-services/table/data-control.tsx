"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronDown } from "lucide-react";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";

interface DataControlProps<TData> {
	table: Table<TData>;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const isTablet = useIsTablet();

	const searchColumns = ["name", "category"];
	const primarySortColumn = "name";
	const secondarySortColumn = "defaultPrice";
	const primarySortLabel = "Name";
	const secondarySortLabel = "Price";

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:px-4 lg:py-4">
			{!isTablet ? (
				<div className="hidden items-center gap-2 lg:flex">
					<QuerySearchField
						table={table}
						columns={searchColumns}
						placeholder="Search services..."
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto rounded-none">
								{table.getAllColumns().filter((column) => column.getIsVisible())
									.length - 1}{" "}
								columns
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="rounded-none bg-background"
						>
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="rounded-none capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				<div className="flex flex-col gap-2 lg:hidden">
					<QuerySearchField
						table={table}
						columns={searchColumns}
						placeholder="Search services..."
					/>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn(primarySortColumn)
									?.toggleSorting(
										table.getColumn(primarySortColumn)?.getIsSorted() === "asc",
									)
							}
							className="rounded-none"
						>
							<ArrowDown
								className={cn(
									"mr-2 h-4 w-4 transition-transform",
									table.getColumn(primarySortColumn)?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
							{primarySortLabel}
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn(secondarySortColumn)
									?.toggleSorting(
										table.getColumn(secondarySortColumn)?.getIsSorted() ===
											"asc",
									)
							}
							className="rounded-none"
						>
							<ArrowDown
								className={cn(
									"mr-2 h-4 w-4 transition-transform",
									table.getColumn(secondarySortColumn)?.getIsSorted() ===
										"asc" && "-rotate-180",
								)}
							/>
							{secondarySortLabel}
						</Button>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => table.setPageSize(Number(value))}
						>
							<SelectTrigger className="rounded-none">
								<SelectValue placeholder="Page size" />
							</SelectTrigger>
							<SelectContent className="rounded-none bg-background">
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem
										key={pageSize}
										value={`${pageSize}`}
										className="rounded-none"
									>
										{pageSize} rows
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			)}
		</div>
	);
}
