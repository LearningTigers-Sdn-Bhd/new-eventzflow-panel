"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EmailDelivery } from "@/lib/api/email-delivery";

export interface EmailDeliveriesTableMeta {
	onView: (delivery: EmailDelivery) => void;
	onResend: (delivery: EmailDelivery) => void;
	pendingResendId: number | null;
}

const statusTone: Record<EmailDelivery["status"], string> = {
	queued: "border-slate-400 text-slate-700",
	sending: "border-blue-400 text-blue-700",
	sent: "border-cyan-400 text-cyan-700",
	delivered: "border-green-500 text-green-700",
	failed: "border-red-500 text-red-700",
	bounced: "border-orange-500 text-orange-700",
	complained: "border-yellow-500 text-yellow-700",
	suppressed: "border-zinc-500 text-zinc-700",
};

export const emailDeliveriesColumns: ColumnDef<EmailDelivery>[] = [
	{
		accessorKey: "recipient",
		header: "Recipient",
		cell: ({ row }) => (
			<div className="text-sm">
				<p className="font-medium">{row.original.recipient || "-"}</p>
				<p className="text-muted-foreground text-xs">
					{row.original.subject || "-"}
				</p>
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge variant="outline" className={statusTone[row.original.status]}>
				{row.original.status}
			</Badge>
		),
	},
	{
		accessorKey: "mailerName",
		header: "Mailer",
		cell: ({ row }) => (
			<span className="text-sm">
				{row.original.mailerName}.{row.original.mailerAction}
			</span>
		),
	},
	{
		accessorKey: "providerMessageId",
		header: "Provider ID",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-xs">
				{row.original.providerMessageId || "-"}
			</span>
		),
	},
	{
		accessorKey: "lastError",
		header: "Last Error",
		cell: ({ row }) => (
			<span className="line-clamp-2 text-muted-foreground text-xs">
				{row.original.lastError || row.original.failureReason || "-"}
			</span>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-xs">
				{new Date(row.original.createdAt).toLocaleString()}
			</span>
		),
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row, table }) => {
			const meta = table.options.meta as EmailDeliveriesTableMeta | undefined;
			const delivery = row.original;
			const allowedToResend =
				delivery.status === "failed" ||
				(delivery.status === "sent" && Boolean(delivery.sentAt));

			if (!allowedToResend || !meta) {
				return (
					<Button
						size="sm"
						variant="outline"
						className="rounded-none"
						onClick={() => meta?.onView(delivery)}
					>
						View
					</Button>
				);
			}

			return (
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="outline"
						className="rounded-none"
						onClick={() => meta.onView(delivery)}
					>
						View
					</Button>
					<Button
						size="sm"
						variant="outline"
						className="rounded-none"
						onClick={() => meta.onResend(delivery)}
						disabled={meta.pendingResendId === delivery.id}
					>
						{meta.pendingResendId === delivery.id ? "Resending..." : "Resend"}
					</Button>
				</div>
			);
		},
	},
];
