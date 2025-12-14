"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronDown, Menu } from "lucide-react";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

type EventFilter = "active" | "archived" | "all";

interface DataControlProps<TData> {
	table: Table<TData>;
	eventFilter?: EventFilter;
	onEventFilterChange?: (filter: EventFilter) => void;
}

export function DataControl<TData>({
	table,
	eventFilter = "active",
	onEventFilterChange,
}: DataControlProps<TData>) {
	const _isTablet = useIsTablet();

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-transparent px-0 py-0 md:px-2 md:py-4 lg:bg-accent lg:px-4 lg:py-4">
			{/* Desktop Control Panel */}
			{!_isTablet ? (
				<div className="hidden items-center gap-2 lg:flex">
					<QuerySearchField
						table={table}
						columns={["title", "id"]}
						placeholder="Search events..."
					/>
					{onEventFilterChange && (
						<Select
							value={eventFilter}
							onValueChange={(value) =>
								onEventFilterChange(value as EventFilter)
							}
						>
							<SelectTrigger className="w-[140px] rounded-none bg-background font-medium">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="rounded-none">
								<SelectItem value="active" className="rounded-none">
									Active
								</SelectItem>
								<SelectItem value="archived" className="rounded-none">
									Archived
								</SelectItem>
								<SelectItem value="all" className="rounded-none">
									All
								</SelectItem>
							</SelectContent>
						</Select>
					)}
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
					<QuerySearchField table={table} placeholder="Search events..." />
					<Collapsible>
						<CollapsibleTrigger asChild>
							<Button
								variant="outline"
								className="w-full rounded-none bg-muted py-5 text-sm tracking-tight"
							>
								More Filter
								<Menu className="size-4" />
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent className="flex flex-col gap-4 bg-foreground/10 p-4">
							{onEventFilterChange && (
								<Select
									value={eventFilter}
									onValueChange={(value) =>
										onEventFilterChange(value as EventFilter)
									}
								>
									<SelectTrigger className="w-full rounded-none bg-background py-5 font-medium text-sm tracking-tight [&>svg]:opacity-100">
										<SelectValue className="bg-background" />
									</SelectTrigger>
									<SelectContent className="rounded-none text-sm">
										<SelectItem value="active" className="rounded-none py-3">
											Active Events
										</SelectItem>
										<SelectItem value="archived" className="rounded-none py-3">
											Archived Events
										</SelectItem>
										<SelectItem value="all" className="rounded-none py-3">
											All Events
										</SelectItem>
									</SelectContent>
								</Select>
							)}
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								<Button
									variant="outline"
									onClick={() =>
										table
											.getColumn("id")
											?.toggleSorting(
												table.getColumn("id")?.getIsSorted() === "asc",
											)
									}
									className="flex items-center justify-between rounded-none py-5 text-sm tracking-tight"
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
											.getColumn("title")
											?.toggleSorting(
												table.getColumn("title")?.getIsSorted() === "asc",
											)
									}
									className="flex items-center justify-between rounded-none py-5 text-sm tracking-tight"
								>
									Title
									<ArrowDown
										className={cn(
											"size-3.5 transition-transform",
											table.getColumn("title")?.getIsSorted() === "asc" &&
												"-rotate-180",
										)}
									/>
								</Button>
								<Button
									variant="outline"
									onClick={() =>
										table
											.getColumn("created_at")
											?.toggleSorting(
												table.getColumn("created_at")?.getIsSorted() === "asc",
											)
									}
									className="flex items-center justify-between rounded-none py-5 text-sm tracking-tight"
								>
									Created At
									<ArrowDown
										className={cn(
											"size-3.5 transition-transform",
											table.getColumn("created_at")?.getIsSorted() === "asc" &&
												"-rotate-180",
										)}
									/>
								</Button>
								<Select
									value={
										(table.getColumn("status")?.getFilterValue() as string) ||
										"all"
									}
									onValueChange={(value) =>
										table
											.getColumn("status")
											?.setFilterValue(value === "all" ? undefined : value)
									}
								>
									<SelectTrigger className="w-full rounded-none bg-background py-5 font-medium text-sm tracking-tight [&>svg]:opacity-100">
										<SelectValue placeholder="All Statuses" />
									</SelectTrigger>
									<SelectContent className="rounded-none text-sm">
										<SelectItem value="all" className="rounded-none py-3">
											All Statuses
										</SelectItem>
										<SelectItem value="draft" className="rounded-none py-3">
											Draft
										</SelectItem>
										<SelectItem value="published" className="rounded-none py-3">
											Published
										</SelectItem>
										<SelectItem value="cancelled" className="rounded-none py-3">
											Cancelled
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</div>
			)}
		</div>
	);
}
