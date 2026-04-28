"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Eye, FileDigit } from "lucide-react";
import { toast } from "sonner";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	getPaymentStatusColor,
	getPaymentStatusText,
	getReviewStatusColor,
	getReviewStatusText,
	getRsvpStatusColor,
	getRsvpStatusText,
	type PaymentStatusString,
	type ReviewStatus,
	type RsvpStatus,
} from "./constants";
import { PendingTicketActionsMenu } from "./pending-ticket-action-menu";

export type PendingTicket = {
	id: string;
	publicId: string;
	role?: string | null;
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
	ticketApplication?: {
		reviewStatus: ReviewStatus;
		rsvpStatus: RsvpStatus;
		reviewedAt: string | null;
		rejectionReason: string | null;
		rsvpSentAt: string | null;
		rsvpConfirmedAt: string | null;
		rsvpExpiresAt: string | null;
	};
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
	hasApplicationWorkflow = true,
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
			accessorKey: "role",
			size: 150,
			header: ({ column }) => <SortableHeader column={column} label="Role" />,
			cell: ({ row }) => {
				const role = row.getValue("role") as string | undefined;
				if (!role) return <span className="text-muted-foreground">-</span>;
				return (
					<Badge
						variant="outline"
						className="rounded-none border-primary/20 bg-primary/5 text-primary"
					>
						{role}
					</Badge>
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
				const hasScreenshot = !!ticket.paymentScreenshotUrl;
				const hasTransactionId = !!ticket.transactionId;

				return (
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2">
							<Badge
								variant="secondary"
								className={cn(
									getPaymentStatusColor(status),
									"shrink-0 rounded-none",
								)}
							>
								{getPaymentStatusText(status)}
							</Badge>

							{hasTransactionId && !hasScreenshot && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => showPaymentInfoToast(ticket)}
									className="h-6 w-6"
									title="View Payment Info"
								>
									<FileDigit className="h-3.5 w-3.5" />
								</Button>
							)}
						</div>

						{hasScreenshot && (
							<Button
								variant="link"
								size="sm"
								asChild
								className="h-auto w-fit p-0 font-medium text-[11px] text-blue-600 transition-colors hover:text-blue-700"
							>
								<a
									href={ticket.paymentScreenshotUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1"
								>
									<Eye className="h-3 w-3" />
									View Payment Info
									<ExternalLink className="h-2.5 w-2.5 opacity-40" />
								</a>
							</Button>
						)}
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

	if (hasApplicationWorkflow) {
		const applicationColumns: ColumnDef<PendingTicket>[] = [
			{
				id: "reviewStatus",
				accessorFn: (row) =>
					row.ticketApplication?.reviewStatus ?? "pending_review",
				size: 150,
				header: "Review Status",
				cell: ({ row }) => {
					const status = row.original.ticketApplication?.reviewStatus;
					if (!status) {
						return <span className="text-muted-foreground">-</span>;
					}
					return (
						<Badge
							variant="secondary"
							className={cn(getReviewStatusColor(status), "rounded-none")}
						>
							{getReviewStatusText(status)}
						</Badge>
					);
				},
				filterFn: (row, id, value) => {
					return value.includes(row.getValue(id));
				},
			},
			{
				id: "rsvpStatus",
				accessorFn: (row) =>
					row.ticketApplication?.rsvpStatus ?? "not_sent",
				size: 130,
				header: "RSVP Status",
				cell: ({ row }) => {
					const status = row.original.ticketApplication?.rsvpStatus;
					if (!status) {
						return <span className="text-muted-foreground">-</span>;
					}
					return (
						<Badge
							variant="secondary"
							className={cn(getRsvpStatusColor(status), "rounded-none")}
						>
							{getRsvpStatusText(status)}
						</Badge>
					);
				},
			},
		];

		const transactionIdIndex = baseColumns.findIndex(
			(col) => "accessorKey" in col && col.accessorKey === "transactionId",
		);
		baseColumns.splice(transactionIdIndex, 0, ...applicationColumns);
	}

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
