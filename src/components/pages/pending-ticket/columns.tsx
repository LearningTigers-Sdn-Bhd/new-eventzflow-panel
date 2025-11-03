"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, FileDigit } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PendingTicketActionsMenu } from "./action-menu";
import {
	getPaymentStatusColor,
	getPaymentStatusText,
	type PaymentStatusString,
} from "./constants";

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
 * Renders a sortable column header with an arrow icon
 */
function SortableHeader({
	title,
	column,
}: {
	title: string;
	column: Column<PendingTicket, unknown>;
}) {
	return (
		<div className="flex items-center gap-2">
			<p className="font-medium">{title}</p>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="rounded-none"
			>
				<ArrowDown
					className={cn(
						"size-4 transition-transform",
						column.getIsSorted() === "asc" && "-rotate-180",
					)}
				/>
			</Button>
		</div>
	);
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

export const columns: ColumnDef<PendingTicket>[] = [
	{
		accessorKey: "name",
		size: 180,
		header: ({ column }) => <SortableHeader title="Name" column={column} />,
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
		accessorKey: "email",
		size: 200,
		header: ({ column }) => <SortableHeader title="Email" column={column} />,
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
							className="h-6 w-6 rounded-none"
						>
							<FileDigit className="h-3 w-3" />
						</Button>
					)}
					<div className="flex w-full items-center justify-start gap-2">
						<Badge
							variant="secondary"
							className={cn("rounded-none", getPaymentStatusColor(status))}
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
			return <div className="truncate rounded-none font-medium">{tx}</div>;
		},
	},
	{
		accessorKey: "createdAt",
		size: 130,
		header: ({ column }) => (
			<SortableHeader title="Created At" column={column} />
		),
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			return <div className="font-medium">{date.toLocaleDateString()}</div>;
		},
	},
	{
		id: "actions",
		size: 100,
		enableHiding: false,
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
