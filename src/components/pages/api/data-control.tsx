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
						columns={["name"]}
						placeholder="Search API keys..."
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
				<div className="flex flex-col gap-2 p-2 lg:hidden">
					<div className="flex items-center gap-2">
						<div className="flex-1">
							<QuerySearchField table={table} placeholder="Search..." />
						</div>
						<Select
							value={
								table.getColumn("isActive")?.getFilterValue() === true
									? "active"
									: table.getColumn("isActive")?.getFilterValue() === false
										? "revoked"
										: "all"
							}
							onValueChange={(value) => {
								table
									.getColumn("isActive")
									?.setFilterValue(
										value === "all"
											? undefined
											: value === "active"
												? true
												: false,
									);
							}}
						>
							<SelectTrigger className="w-24 rounded-none">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent className="rounded-none bg-background">
								<SelectItem value="all" className="rounded-none">
									All
								</SelectItem>
								<SelectItem value="active" className="rounded-none">
									Active
								</SelectItem>
								<SelectItem value="revoked" className="rounded-none">
									Revoked
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-between gap-2">
						<div className="flex gap-1">
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									table
										.getColumn("name")
										?.toggleSorting(
											table.getColumn("name")?.getIsSorted() === "asc",
										)
								}
								className="h-8 rounded-none px-2 text-xs"
							>
								<ArrowDown
									className={cn(
										"mr-1 h-3 w-3 transition-transform",
										table.getColumn("name")?.getIsSorted() === "asc" &&
											"-rotate-180",
									)}
								/>
								Name
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									table
										.getColumn("createdAt")
										?.toggleSorting(
											table.getColumn("createdAt")?.getIsSorted() === "asc",
										)
								}
								className="h-8 rounded-none px-2 text-xs"
							>
								<ArrowDown
									className={cn(
										"mr-1 h-3 w-3 transition-transform",
										table.getColumn("createdAt")?.getIsSorted() === "asc" &&
											"-rotate-180",
									)}
								/>
								Date
							</Button>
						</div>
						<span className="text-xs text-muted-foreground">
							{table.getFilteredRowModel().rows.length} keys
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
