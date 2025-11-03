"use client";

import type { Table } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import { getEventTicketTypes } from "@/lib/api/ticket-type";

interface DataControlProps<TData> {
	table: Table<TData>;
	labelsData?: Record<string, string>;
}

function getColumnLabel(columnId: string, labelsData?: Record<string, string>): string {
	if (columnId.startsWith("custom_")) {
		const labelKey = columnId.replace("custom_", "");
		return labelsData?.[labelKey] || columnId;
	}

	const standardLabels: Record<string, string> = {
		name: "Name",
		ticketTypeName: "Ticket Type",
		status: "Status",
		createdAt: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({ table, labelsData }: DataControlProps<TData>) {
	const _isTablet = useIsTablet();
	const params = useParams();
	const eventId = params.event_id as string;

	const { data: eventTicketTypes } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const uniqueTicketTypeNames = React.useMemo(() => {
		const names = new Set<string>();
		table.getPreFilteredRowModel().rows.forEach((row) => {
			const typeName = (row.original as any)?.ticketTypeName;
			if (typeName && typeName !== "N/A") {
				names.add(typeName);
			}
		});
		return Array.from(names).sort();
	}, [table]);

	const ticketTypes =
		eventTicketTypes && eventTicketTypes.length > 0
			? eventTicketTypes
			: uniqueTicketTypeNames.map((name) => ({ id: name, name }));

	const statusFilter =
		(table.getColumn("status")?.getFilterValue() as string[]) ?? [];
	
	const ticketTypeFilter =
		(table.getColumn("ticketTypeName")?.getFilterValue() as string[]) ?? [];

	const handleStatusFilter = (status: string) => {
		if (status === "all") {
			table.getColumn("status")?.setFilterValue(undefined);
		} else {
			table.getColumn("status")?.setFilterValue([status]);
		}
	};

	const handleTicketTypeFilter = (ticketTypeName: string) => {
		if (ticketTypeName === "all") {
			table.getColumn("ticketTypeName")?.setFilterValue(undefined);
		} else {
			table.getColumn("ticketTypeName")?.setFilterValue([ticketTypeName]);
		}
	};

	return (
		<>
			{!_isTablet ? (
				<div className="hidden items-center gap-2 py-4 lg:flex">
					<QuerySearchField
						table={table}
						columns={["name", "phone"]}
						searchCustomFields={true}
						placeholder="Search tickets..."
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								Status:{" "}
								{statusFilter.length === 0
									? "All"
									: statusFilter[0] === "scanned"
										? "Scanned"
										: "Not Scanned"}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleStatusFilter("all")}>
								All
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleStatusFilter("scanned")}>
								Scanned
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleStatusFilter("not_scanned")}
							>
								Not Scanned
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								Ticket Type:{" "}
								{ticketTypeFilter.length === 0
									? "All"
									: ticketTypeFilter[0]}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleTicketTypeFilter("all")}>
								All
							</DropdownMenuItem>
							{ticketTypes?.map((ticketType) => (
								<DropdownMenuItem
									key={ticketType.id}
									onClick={() => handleTicketTypeFilter(ticketType.name)}
								>
									{ticketType.name}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto">
								Columns ({table.getAllColumns().filter((column) => column.getIsVisible())
									.length - 1})
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-64 max-h-[400px] overflow-y-auto">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide() && column.id !== "phone")
								.map((column) => {
									const label = getColumnLabel(column.id, labelsData);
									
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{label}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				<div className="flex flex-col gap-2 py-4 lg:hidden">
					<QuerySearchField
						table={table}
						columns={["name", "phone"]}
						searchCustomFields={true}
						placeholder="Search tickets..."
					/>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("name")
									?.toggleSorting(
										table.getColumn("name")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
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
									.getColumn("status")
									?.toggleSorting(
										table.getColumn("status")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Status
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("status")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("createdAt")
									?.toggleSorting(
										table.getColumn("createdAt")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Created
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("createdAt")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
