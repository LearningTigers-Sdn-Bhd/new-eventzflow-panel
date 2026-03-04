"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { RedemptionLog } from "@/lib/api/voucher-redemption-log";
import { cn } from "@/lib/utils";

// Re-export RedemptionLog as BaseRedemptionLog for consistency with event-ticket pattern
export type BaseRedemptionLog = RedemptionLog;

// Filter options for redeemerType
const REDEEMER_TYPE_OPTIONS = [
	{ label: "User", value: "user_redeemer" },
	{ label: "Visitor", value: "visitor_redeemer" },
	{ label: "Ticket", value: "ticket_redeemer" },
];

// Filter options for redemptionStatus
const REDEMPTION_STATUS_OPTIONS = [
	{ label: "Completed", value: "completed" },
	{ label: "Cancelled", value: "cancelled" },
];

// Helper function to format date with date and time parts
function formatDateTime(dateString: string): {
	datePart: string;
	timePart: string;
} {
	const date = new Date(dateString);
	const datePart = date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
	const timePart = date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return { datePart, timePart };
}

export function generateColumns(): ColumnDef<BaseRedemptionLog>[] {
	return [
		{
			accessorKey: "redemptionTimestamp",
			size: 180,
			header: ({ column }) => <SortableHeader column={column} label="Time" />,
			cell: ({ row }) => {
				const { datePart, timePart } = formatDateTime(
					row.getValue("redemptionTimestamp"),
				);
				return (
					<div className="text-sm">
						<div className="font-medium">{datePart}</div>
						<div className="text-muted-foreground text-xs">{timePart}</div>
					</div>
				);
			},
		},
		{
			id: "voucher",
			size: 200,
			accessorFn: (row) => row.voucher?.title,
			header: () => <p className="font-medium">Voucher</p>,
			cell: ({ row }) => {
				const voucher = row.original.voucher;
				return (
					<div className="space-y-0.5">
						<div className="font-medium">{voucher?.title || "-"}</div>
						<div className="text-muted-foreground text-xs">
							{voucher?.voucherCode || "-"}
						</div>
					</div>
				);
			},
		},
		{
			id: "redeemer",
			size: 200,
			accessorFn: (row) => row.redeemer?.fullName || row.redeemerName,
			header: () => <p className="font-medium">Redeemer</p>,
			cell: ({ row }) => {
				const redeemer = row.original.redeemer;
				const fallbackName = row.original.redeemerName;
				return (
					<div className="space-y-0.5">
						<div className="font-medium">
							{redeemer?.fullName || fallbackName || "-"}
						</div>
						<div className="text-muted-foreground text-xs">
							{redeemer?.email || redeemer?.phone || "-"}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "redeemerType",
			size: 120,
			header: ({ column }) => (
				<FilterableHeader
					column={column}
					label="Type"
					options={REDEEMER_TYPE_OPTIONS}
					allOptionLabel="All Types"
				/>
			),
			cell: ({ row }) => {
				const type = row.getValue("redeemerType") as
					| "user_redeemer"
					| "visitor_redeemer"
					| "ticket_redeemer";
				const isUser = type === "user_redeemer";
				const isTicket = type === "ticket_redeemer";
				return (
					<Badge
						variant={isUser ? "default" : isTicket ? "outline" : "secondary"}
						className={cn(
							"rounded-none capitalize",
							isTicket && "border-purple-500 text-purple-500",
						)}
					>
						{isUser ? "User" : isTicket ? "Ticket" : "Visitor"}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				if (value === undefined) return true;
				if (Array.isArray(value)) {
					return value.includes(row.getValue(id));
				}
				return row.getValue(id) === value;
			},
		},
		{
			accessorKey: "redemptionStatus",
			size: 120,
			header: ({ column }) => (
				<FilterableHeader
					column={column}
					label="Status"
					options={REDEMPTION_STATUS_OPTIONS}
					allOptionLabel="All Status"
				/>
			),
			cell: ({ row }) => {
				const status = row.getValue("redemptionStatus") as
					| "completed"
					| "cancelled";
				const isCompleted = status === "completed";
				return (
					<Badge
						variant={isCompleted ? "default" : "destructive"}
						className="rounded-none capitalize"
					>
						{isCompleted ? "Completed" : "Cancelled"}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				if (value === undefined) return true;
				if (Array.isArray(value)) {
					return value.includes(row.getValue(id));
				}
				return row.getValue(id) === value;
			},
		},
		{
			accessorKey: "transactionGrossAmount",
			size: 120,
			header: ({ column }) => (
				<SortableHeader column={column} label="Original Price" />
			),
			cell: ({ row }) => {
				const amount = row.getValue("transactionGrossAmount") as number;
				return <div className="font-medium">RM {amount.toFixed(2)}</div>;
			},
		},
		{
			accessorKey: "discountAppliedValue",
			size: 120,
			header: () => <p className="font-medium">Discount</p>,
			cell: ({ row }) => {
				const discount = row.getValue("discountAppliedValue") as number;
				return (
					<div className="font-medium text-green-600">
						-RM {discount.toFixed(2)}
					</div>
				);
			},
		},
		{
			accessorKey: "transactionNetAmount",
			size: 120,
			header: ({ column }) => (
				<SortableHeader column={column} label="Price after Discount" />
			),
			cell: ({ row }) => {
				const amount = row.getValue("transactionNetAmount") as number;
				return <div className="font-bold">RM {amount.toFixed(2)}</div>;
			},
		},
	];
}
