"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileDigit } from "lucide-react";
import { toast } from "sonner";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	getPaymentStatusColor,
	getPaymentStatusText,
	type PaymentStatusString,
} from "./constants";
import { PendingTicketActionsMenu } from "./pending-ticket-action-menu";

export type PendingTicket = {
	id: string;
	name: string;
	email: string | null;
	phone: string;
	value: number;
	status: "scanned" | "not_scanned";
	customLabels: Array<{ name: string; value: string }>;
	createdAt: string;
	paymentStatus: PaymentStatusString;
	paymentScreenshotUrl?: string;
	transactionId?: string;
	paymentMethod?: string;
	ticketTypeName?: string;
	ticketTypeId?: number;
};

/**
 * Helper to format created date similar to main ticket table
 */
function formatDateTime(dateString: string): {
	timePart: string;
	datePart: string;
} {
	const date = new Date(dateString);
	const timePart = date.toLocaleString("en-US", { timeStyle: "medium" });
	const datePart = date.toLocaleString("en-US", { dateStyle: "medium" });
	return { timePart, datePart };
}

/**
 * Shows payment information in a toast notification
 */
function showPaymentInfoToast(ticket: PendingTicket) {
	const paymentInfo: string[] = [];
	if (ticket.paymentScreenshotUrl) {
		paymentInfo.push(`Screenshot URL: ${ticket.paymentScreenshotUrl}`);
	}
	if (ticket.transactionId) {
		paymentInfo.push(`Transaction ID: ${ticket.transactionId}`);
	}

	if (paymentInfo.length > 0) {
		toast.custom((_t) => (
			<div className="rounded-lg border bg-white p-4 shadow-lg">
				<div className="mb-2 font-semibold">Payment Information:</div>
				<div className="space-y-1">
					{paymentInfo.map((info) => (
						<div key={info} className="text-sm">
							{info}
						</div>
					))}
				</div>
			</div>
		));
	} else {
		toast.info("No payment information available");
	}
}

export function generateColumns(
	labelsData?: Record<string, string>,
): ColumnDef<PendingTicket>[] {
	const baseColumns: ColumnDef<PendingTicket>[] = [
		{
			accessorKey: "name",
			size: 180,
			header: ({ column }) => <SortableHeader column={column} label="Name" />,
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<div className="truncate font-medium">{row.getValue("name")}</div>
					<div className="truncate text-muted-foreground text-xs">
						{row.original.phone}
					</div>
				</div>
			),
		},
		{
			accessorKey: "phone",
			enableHiding: false,
			enableSorting: false,
			// Hidden column used for search functionality
		},
		{
			accessorKey: "email",
			size: 200,
			header: ({ column }) => <SortableHeader column={column} label="Email" />,
			cell: ({ row }) => {
				const email = row.getValue("email") as string | null;
				return (
					<div
						className={cn(
							"truncate font-medium",
							!email && "text-muted-foreground italic",
						)}
					>
						{email || "Not provided"}
					</div>
				);
			},
		},
		{
			accessorKey: "ticketTypeName",
			size: 180,
			header: "Ticket Type",
			cell: ({ row }) => {
				return (
					<div className="flex flex-col gap-1">
						<div className="truncate font-medium">
							{row.getValue("ticketTypeName") || "N/A"}
						</div>
					</div>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "paymentStatus",
			size: 160,
			header: "Payment Status",
			cell: ({ row }) => {
				const ticket = row.original;
				const status = ticket.paymentStatus;
				const hasPaymentInfo =
					ticket.paymentScreenshotUrl || ticket.transactionId;

				return (
					<div className="flex items-center justify-between gap-2">
						{hasPaymentInfo && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => showPaymentInfoToast(ticket)}
								className="h-6 w-6"
							>
								<FileDigit className="h-3 w-3" />
							</Button>
						)}
						<div className="flex w-full items-center justify-start gap-2">
							<Badge
								variant="secondary"
								className={cn(getPaymentStatusColor(status), "rounded-none")}
							>
								{getPaymentStatusText(status)}
							</Badge>
						</div>
					</div>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "transactionId",
			size: 160,
			header: "Transaction ID",
			cell: ({ row }) => {
				const tx = (row.getValue("transactionId") as string) || "-";
				return <div className="truncate font-medium">{tx}</div>;
			},
		},
		{
			accessorKey: "createdAt",
			size: 130,
			header: ({ column }) => (
				<SortableHeader column={column} label="Created At" />
			),
			cell: ({ row }) => {
				const { timePart, datePart } = formatDateTime(
					row.getValue("createdAt") as string,
				);
				return (
					<div className="font-medium">
						<div className="font-semibold">{timePart}</div>
						<div className="text-gray-500 text-sm">{datePart}</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			size: 100,
			enableHiding: false,
			meta: {
				sticky: "right",
			},
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const ticket = row.original;
				return (
					<div className="flex justify-center">
						<PendingTicketActionsMenu ticket={ticket} />
					</div>
				);
			},
		},
	];

	// Generate dynamic columns for custom fields
	const customColumns: ColumnDef<PendingTicket>[] = [];
	if (labelsData && Object.keys(labelsData).length > 0) {
		Object.entries(labelsData).forEach(([key, labelName]) => {
			customColumns.push({
				id: `custom_${key}`,
				accessorFn: (row) => {
					// NOTE:
					// - Backend custom_fields_data is key -> value
					// - transformPendingTicket stores customLabels with name = key
					// - So we must look up by the key here, not by the human-readable label
					const customLabel = row.customLabels?.find((l) => l.name === key);
					return customLabel?.value || "";
				},
				size: 180,
				header: ({ column }) => (
					<SortableHeader column={column} label={labelName} />
				),
				cell: ({ row }) => {
					const customLabel = row.original.customLabels?.find(
						(l) => l.name === key,
					);
					const value = customLabel?.value || "";
					return (
						<div
							className={cn(
								"truncate font-medium",
								!value && "text-muted-foreground italic",
							)}
						>
							{value || "Not provided"}
						</div>
					);
				},
				enableSorting: true,
				enableHiding: true,
			});
		});
	}

	// Insert custom columns before the Created At column for consistency
	const createdAtIndex = baseColumns.findIndex(
		(col) => "accessorKey" in col && col.accessorKey === "createdAt",
	);

	return [
		...baseColumns.slice(0, createdAtIndex),
		...customColumns,
		...baseColumns.slice(createdAtIndex),
	];
}
