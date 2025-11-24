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
	const _isTablet = useIsTablet();

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:px-4 lg:py-4">
			{/* Desktop Control Panel */}
			{!_isTablet ? (
				<div className="hidden items-center gap-2 lg:flex">
					<QuerySearchField
						table={table}
						columns={["title", "merchant"]}
						placeholder="Search vouchers..."
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto rounded-none">
								{/* Number of columns visible */}
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
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="rounded-none capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{(column.id || "").replace(/_/g, " ")}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				/* Mobile Control Panel */
				<div className="flex flex-col gap-2 lg:hidden">
					<QuerySearchField table={table} placeholder="Search vouchers..." />
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("title")
									?.toggleSorting(
										table.getColumn("title")?.getIsSorted() === "asc",
									)
							}
							className="rounded-none"
						>
							<ArrowDown
								className={cn(
									"mr-2 h-4 w-4 transition-transform",
									table.getColumn("title")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
							Title
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("validity")
									?.toggleSorting(
										table.getColumn("validity")?.getIsSorted() === "asc",
									)
							}
							className="rounded-none"
						>
							<ArrowDown
								className={cn(
									"mr-2 h-4 w-4 transition-transform",
									table.getColumn("validity")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
							Validity
						</Button>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
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
