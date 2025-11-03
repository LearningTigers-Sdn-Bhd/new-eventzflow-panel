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
						columns={["name", "id"]}
						placeholder="Search locations..."
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
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				/* Mobile Control Panel */
				<div className="flex flex-col gap-2 lg:hidden">
					<QuerySearchField
						table={table}
						columns={["name", "id"]}
						placeholder="Search locations..."
					/>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("id")
									?.toggleSorting(
										table.getColumn("id")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-xs"
						>
							ID
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("id")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
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
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("assignedMembersCount")
									?.toggleSorting(
										table.getColumn("assignedMembersCount")?.getIsSorted() ===
											"asc",
									)
							}
							className="col-span-2 flex items-center justify-between rounded-none text-xs sm:col-span-1"
						>
							Members
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("assignedMembersCount")?.getIsSorted() ===
										"asc" && "-rotate-180",
								)}
							/>
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
