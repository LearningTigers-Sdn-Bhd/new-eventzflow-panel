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
import type { Event } from "@/lib/api/event";

interface DataControlProps<TData> {
	table: Table<TData>;
	events: Event[];
}

export function DataControl<TData>({ table, events }: DataControlProps<TData>) {
	const _isMobile = useIsMobile();

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:px-4 lg:py-4">
			{/* Desktop Control Panel */}
			{!_isMobile ? (
				<div className="hidden items-center gap-2 lg:flex">
					<QuerySearchField
						table={table}
						columns={["event", "company_name", "booth_number", "pic_full_name"]}
						placeholder="Search by event, company, or booth..."
					/>
					<Select
						value={
							(table.getColumn("payment_status")?.getFilterValue() as string) || "all"
						}
						onValueChange={(value) =>
							table
								.getColumn("payment_status")
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
							<SelectItem value="paid" className="rounded-none">
								Paid
							</SelectItem>
							<SelectItem value="unpaid" className="rounded-none">
								Unpaid
							</SelectItem>
							<SelectItem value="waived" className="rounded-none">
								Waived
							</SelectItem>
							<SelectItem value="sponsored" className="rounded-none">
								Sponsored
							</SelectItem>
						</SelectContent>
					</Select>
					<Select
						value={
							(table.getColumn("event")?.getFilterValue() as string) || "all"
						}
						onValueChange={(value) =>
							table
								.getColumn("event")
								?.setFilterValue(value === "all" ? undefined : value)
						}
					>
						<SelectTrigger className="w-[200px] rounded-none">
							<SelectValue placeholder="All Events" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="all" className="rounded-none">
								All Events
							</SelectItem>
							{events.map((event) => (
								<SelectItem key={event.id} value={event.title} className="rounded-none">
									{event.title}
								</SelectItem>
							))}
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
					<QuerySearchField 
						table={table} 
						columns={["event", "company_name", "booth_number", "pic_full_name"]}
						placeholder="Search by event, company, or booth..." 
					/>
					<div className="grid grid-cols-2 gap-2">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("company_name")
									?.toggleSorting(
										table.getColumn("company_name")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-xs"
						>
							Company
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("company_name")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Select
							value={
								(table.getColumn("payment_status")?.getFilterValue() as string) || "all"
							}
							onValueChange={(value) =>
								table
									.getColumn("payment_status")
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
								<SelectItem value="paid" className="rounded-none">
									Paid
								</SelectItem>
								<SelectItem value="unpaid" className="rounded-none">
									Unpaid
								</SelectItem>
								<SelectItem value="waived" className="rounded-none">
									Waived
								</SelectItem>
								<SelectItem value="sponsored" className="rounded-none">
									Sponsored
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Select
						value={
							(table.getColumn("event")?.getFilterValue() as string) || "all"
						}
						onValueChange={(value) =>
							table
								.getColumn("event")
								?.setFilterValue(value === "all" ? undefined : value)
						}
					>
						<SelectTrigger className="w-full rounded-none font-medium text-xs">
							<SelectValue placeholder="All Events" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="all" className="rounded-none">
								All Events
							</SelectItem>
							{events.map((event) => (
								<SelectItem key={event.id} value={event.title} className="rounded-none">
									{event.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
		</div>
	);
}