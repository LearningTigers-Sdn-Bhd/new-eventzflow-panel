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
import { getPaymentStatusText } from "./constants";

interface DataControlProps<TData> {
	table: Table<TData>;
}

const PAYMENT_STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "pending", label: "Pending" },
	{ value: "completed", label: "Completed" },
	{ value: "failed", label: "Failed" },
	{ value: "approval_pending", label: "Approval Pending" },
	{ value: "rejected", label: "Rejected" },
] as const;

const SEARCH_COLUMNS = ["name", "email", "phone"];

export function DataControl<TData>({ table }: DataControlProps<TData>) {
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

	const paymentStatusFilter =
		(table.getColumn("paymentStatus")?.getFilterValue() as string[]) ?? [];

	const ticketTypeFilter =
		(table.getColumn("ticketTypeName")?.getFilterValue() as string[]) ?? [];

	const handlePaymentStatusFilter = (status: string) => {
		if (status === "all") {
			table.getColumn("paymentStatus")?.setFilterValue(undefined);
		} else {
			table.getColumn("paymentStatus")?.setFilterValue([status]);
		}
	};

	const handleTicketTypeFilter = (ticketTypeName: string) => {
		if (ticketTypeName === "all") {
			table.getColumn("ticketTypeName")?.setFilterValue(undefined);
		} else {
			table.getColumn("ticketTypeName")?.setFilterValue([ticketTypeName]);
		}
	};

	const currentStatusLabel =
		paymentStatusFilter.length === 0
			? "All"
			: getPaymentStatusText(paymentStatusFilter[0] as any) ||
				paymentStatusFilter[0];

	return (
		<>
			{/* Desktop Control Panel */}
			{!_isTablet ? (
				<div className="hidden items-center gap-2 py-4 lg:flex">
					<QuerySearchField
						table={table}
						columns={SEARCH_COLUMNS}
						placeholder="Search pending tickets..."
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								Payment Status: {currentStatusLabel}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{PAYMENT_STATUS_OPTIONS.map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => handlePaymentStatusFilter(option.value)}
								>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								Ticket Type:{" "}
								{ticketTypeFilter.length === 0 ? "All" : ticketTypeFilter[0]}
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
								{table.getAllColumns().filter((column) => column.getIsVisible())
									.length - 1}{" "}
								columns
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
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
				<div className="flex flex-col gap-2 py-4 lg:hidden">
					<QuerySearchField
						table={table}
						columns={SEARCH_COLUMNS}
						placeholder="Search pending tickets..."
					/>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
									.getColumn("email")
									?.toggleSorting(
										table.getColumn("email")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Email
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("email")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("paymentStatus")
									?.toggleSorting(
										table.getColumn("paymentStatus")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Payment Status
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("paymentStatus")?.getIsSorted() === "asc" &&
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
