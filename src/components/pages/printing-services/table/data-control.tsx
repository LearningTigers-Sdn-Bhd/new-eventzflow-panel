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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DataControlProps<TData> {
	table: Table<TData>;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const _isMobile = useIsMobile();

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:px-4 lg:py-4">
			{/* Desktop Control Panel */}
			{!_isMobile ? (
				<div className="hidden items-center gap-2 lg:flex">
					<QuerySearchField
						table={table}
						columns={["name", "category"]}
						placeholder="Search services..."
					/>
					<Select
						value={
							(table.getColumn("status")?.getFilterValue() as string) || "all"
						}
						onValueChange={(value) =>
							table
								.getColumn("status")
								?.setFilterValue(value === "all" ? undefined : value)
						}
					>
						<SelectTrigger className="w-[150px] rounded-none">
							<SelectValue placeholder="All Statuses" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="all" className="rounded-none">
								All Statuses
							</SelectItem>
							<SelectItem value="active" className="rounded-none">
								Active
							</SelectItem>
							<SelectItem value="inactive" className="rounded-none">
								Inactive
							</SelectItem>
						</SelectContent>
					</Select>
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
											{column.id.replace(/([A-Z])/g, " $1").trim()}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				/* Mobile Control Panel */
				<div className="flex flex-col gap-2 lg:hidden">
					<QuerySearchField table={table} placeholder="Search services..." />
					<div className="grid grid-cols-2 gap-2">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("name")
									?.toggleSorting(
										table.getColumn("name")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-xs"
						>
							Name
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("name")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Select
							value={
								(table.getColumn("status")?.getFilterValue() as string) || "all"
							}
							onValueChange={(value) =>
								table
									.getColumn("status")
									?.setFilterValue(value === "all" ? undefined : value)
							}
						>
							<SelectTrigger className="w-full rounded-none font-medium text-xs">
								<SelectValue placeholder="All Statuses" />
							</SelectTrigger>
							<SelectContent className="rounded-none">
								<SelectItem value="all" className="rounded-none">
									All Statuses
								</SelectItem>
								<SelectItem value="active" className="rounded-none">
									Active
								</SelectItem>
								<SelectItem value="inactive" className="rounded-none">
									Inactive
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			)}
		</div>
	);
}
