"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
	EmailStatus,
	EventEmailDelivery,
} from "@/lib/api/event-email-status";
import { cn } from "@/lib/utils";
import {
	emailTypeLabel,
	needsAddressFix,
	problemReason,
	STATUS_LABELS,
} from "./email-status-labels";

export interface EventEmailTableMeta {
	onFix: (delivery: EventEmailDelivery) => void;
	onResend: (delivery: EventEmailDelivery) => void;
	pendingResendId: number | null;
}

export const statusTone: Record<EmailStatus, string> = {
	queued: "bg-slate-500 text-white border-transparent",
	sending: "bg-slate-500 text-white border-transparent",
	sent: "bg-cyan-500 text-white border-transparent",
	delivered: "bg-green-500 text-white border-transparent",
	failed: "bg-red-500 text-white border-transparent",
	bounced: "bg-orange-500 text-white border-transparent",
	complained: "bg-yellow-600 text-white border-transparent",
	suppressed: "bg-zinc-500 text-white border-transparent",
};

export function StatusBadge({ status }: { status: EmailStatus }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-none px-2 py-0.5 font-bold text-xs",
				statusTone[status],
			)}
		>
			{STATUS_LABELS[status]}
		</Badge>
	);
}

export function EmailStatusActions({
	delivery,
	meta,
}: {
	delivery: EventEmailDelivery;
	meta: EventEmailTableMeta;
}) {
	if (!delivery.canResend)
		return <span className="text-muted-foreground">-</span>;

	const fix = needsAddressFix(delivery.status);
	const pending = meta.pendingResendId === delivery.id;

	return (
		<Button
			size="sm"
			variant="outline"
			className="rounded-none"
			disabled={pending}
			onClick={() => (fix ? meta.onFix(delivery) : meta.onResend(delivery))}
		>
			{pending ? (
				<Loader2 className="size-4 animate-spin" />
			) : fix ? (
				<Pencil className="size-4" />
			) : (
				<Send className="size-4" />
			)}
			{fix ? "Fix & resend" : "Resend"}
		</Button>
	);
}

export const eventEmailStatusColumns: ColumnDef<EventEmailDelivery>[] = [
	{
		accessorKey: "recipient",
		header: "Attendee",
		cell: ({ row }) => (
			<div className="text-sm">
				<p className="font-medium">{row.original.attendee?.name ?? "-"}</p>
				<p className="break-all text-muted-foreground text-xs">
					{row.original.recipient || "-"}
				</p>
			</div>
		),
	},
	{
		accessorKey: "emailType",
		header: "Email",
		cell: ({ row }) => (
			<span className="text-sm">{emailTypeLabel(row.original.emailType)}</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const reason = problemReason(row.original.status, row.original.problem);
			return (
				<div className="space-y-1">
					<StatusBadge status={row.original.status} />
					{reason && (
						<p className="max-w-[14rem] whitespace-normal text-muted-foreground text-xs">
							{reason}
						</p>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Sent At",
		cell: ({ row }) => {
			const sent = new Date(row.original.createdAt);
			return (
				<div className="font-medium">
					<p className="font-semibold">
						{sent.toLocaleString("en-US", { timeStyle: "medium" })}
					</p>
					<p className="text-gray-500 text-sm">
						{sent.toLocaleString("en-US", { dateStyle: "medium" })}
					</p>
				</div>
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row, table }) => {
			const meta = table.options.meta as EventEmailTableMeta | undefined;
			return meta ? (
				<EmailStatusActions delivery={row.original} meta={meta} />
			) : null;
		},
	},
];
