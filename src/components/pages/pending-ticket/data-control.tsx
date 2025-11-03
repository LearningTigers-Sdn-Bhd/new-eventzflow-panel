"use client";

import { useQuery } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
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
import { getEventTicketTypes } from "@/lib/api/ticket-type";
import { cn } from "@/lib/utils";
import { getPaymentStatusText, type PaymentStatusString } from "./constants";

interface DataControlProps<TData> {
	table: Table<TData>;
	labelsData?: Record<string, string>;
}

const PAYMENT_STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "pending", label: "Pending" },
	{ value: "completed", label: "Completed" },
	{ value: "failed", label: "Failed" },
	{ value: "approval_pending", label: "Approval Pending" },
	{ value: "rejected", label: "Rejected" },
] as const;

const SEARCH_COLUMNS = [
	"name",
	"email",
	"phone",
	"ticketTypeName",
	"transactionId",
];

function getColumnLabel(
	columnId: string,
	labelsData?: Record<string, string>,
): string {
	if (columnId.startsWith("custom_")) {
		const labelKey = columnId.replace("custom_", "");
		return labelsData?.[labelKey] || columnId;
	}

	const standardLabels: Record<string, string> = {
		name: "Name",
		email: "Email",
		ticketTypeName: "Ticket Type",
		paymentStatus: "Payment Status",
		transactionId: "Transaction ID",
		createdAt: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({
	table,
	labelsData,
}: DataControlProps<TData>) {
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
			const typeName = (row.original as Record<string, unknown>)
				?.ticketTypeName;
			if (typeName && typeName !== "N/A") {
				names.add(typeName as string);
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
			: getPaymentStatusText(paymentStatusFilter[0] as PaymentStatusString) ||
				paymentStatusFilter[0];

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:px-4 lg:py-4">
			{/* Desktop Control Panel */}
			{!_isTablet ? (
				<div className="hidden items-center gap-2 lg:flex">
					<QuerySearchField
						table={table}
						columns={SEARCH_COLUMNS}
						searchCustomFields={true}
						placeholder="Search pending tickets..."
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="rounded-none">
								Payment Status: {currentStatusLabel}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="rounded-none bg-background"
						>
							{PAYMENT_STATUS_OPTIONS.map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => handlePaymentStatusFilter(option.value)}
									className="rounded-none"
								>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="rounded-none">
								Ticket Type:{" "}
								{ticketTypeFilter.length === 0 ? "All" : ticketTypeFilter[0]}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="rounded-none bg-background"
						>
							<DropdownMenuItem onClick={() => handleTicketTypeFilter("all")}>
								All
							</DropdownMenuItem>
							{ticketTypes?.map((ticketType) => (
								<DropdownMenuItem
									key={ticketType.id}
									onClick={() => handleTicketTypeFilter(ticketType.name)}
									className="rounded-none"
								>
									{ticketType.name}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
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
								.filter(
									(column) => column.getCanHide() && column.id !== "phone",
								)
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
											{getColumnLabel(column.id, labelsData)}
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
						columns={SEARCH_COLUMNS}
						searchCustomFields={true}
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
							className="flex items-center justify-between rounded-none text-left text-xs"
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
							className="flex items-center justify-between rounded-none text-left text-xs"
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
							className="flex items-center justify-between rounded-none text-left text-xs"
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
							className="flex items-center justify-between rounded-none text-left text-xs"
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
		</div>
	);
}
