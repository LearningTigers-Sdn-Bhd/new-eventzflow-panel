"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EmailDelivery } from "@/lib/api/email-delivery";
import { cn } from "@/lib/utils";

export interface EmailDeliveriesTableMeta {
	onView: (delivery: EmailDelivery) => void;
	onResend: (delivery: EmailDelivery) => void;
	pendingResendId: number | null;
}

const statusTone: Record<EmailDelivery["status"], string> = {
	queued: "bg-slate-500 text-white border-transparent",
	sending: "bg-blue-500 text-white border-transparent",
	sent: "bg-cyan-500 text-white border-transparent",
	delivered: "bg-green-500 text-white border-transparent",
	failed: "bg-red-500 text-white border-transparent",
	bounced: "bg-orange-500 text-white border-transparent",
	complained: "bg-yellow-600 text-white border-transparent",
	suppressed: "bg-zinc-500 text-white border-transparent",
};

function formatStatusLabel(status: EmailDelivery["status"]): string {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

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
			<Badge
				variant="outline"
				className={cn(
					"rounded-none px-2 py-0.5 font-bold text-xs",
					statusTone[row.original.status],
				)}
			>
				{formatStatusLabel(row.original.status)}
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
		header: "Created At",
		cell: ({ row }) => {
			const createdAt = new Date(row.original.createdAt);
			return (
				<div className="font-medium">
					<p className="font-semibold">
						{createdAt.toLocaleString("en-US", { timeStyle: "medium" })}
					</p>
					<p className="text-gray-500 text-sm">
						{createdAt.toLocaleString("en-US", { dateStyle: "medium" })}
					</p>
				</div>
			);
		},
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
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 rounded-none border border-border text-green-600 hover:text-green-700"
								onClick={() => meta?.onView(delivery)}
								aria-label="View email log"
							>
								<Eye className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent className="rounded-none">
							View Email Log
						</TooltipContent>
					</Tooltip>
				);
			}

			return (
				<div className="inline-flex items-center border border-border bg-white">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 rounded-none border-border border-r text-green-600 hover:text-green-700"
								onClick={() => meta.onView(delivery)}
								aria-label="View email log"
							>
								<Eye className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent className="rounded-none">
							View Email Log
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 rounded-none text-orange-500 hover:text-orange-600"
								onClick={() => meta.onResend(delivery)}
								disabled={meta.pendingResendId === delivery.id}
								aria-label="Resend email"
							>
								{meta.pendingResendId === delivery.id ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent className="rounded-none">
							Resend Email
						</TooltipContent>
					</Tooltip>
				</div>
			);
		},
	},
];
