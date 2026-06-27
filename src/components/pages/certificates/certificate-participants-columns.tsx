"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
	CertificateDeliveryStatus,
	CertificateParticipant,
} from "@/lib/api/certificate";
import { cn } from "@/lib/utils";

export interface CertificateParticipantsTableMeta {
	onSend: (participant: CertificateParticipant) => void;
	onDownload: (participant: CertificateParticipant) => void;
	pendingSendId: string | null;
	pendingDownloadId: string | null;
}

const statusTone: Record<CertificateDeliveryStatus, string> = {
	queued: "bg-slate-500 text-white border-transparent",
	sending: "bg-blue-500 text-white border-transparent",
	sent: "bg-cyan-500 text-white border-transparent",
	delivered: "bg-green-500 text-white border-transparent",
	failed: "bg-red-500 text-white border-transparent",
	bounced: "bg-orange-500 text-white border-transparent",
	complained: "bg-yellow-600 text-white border-transparent",
	suppressed: "bg-zinc-500 text-white border-transparent",
};

function StatusBadge({ status }: { status: CertificateDeliveryStatus | null }) {
	if (!status) {
		return (
			<Badge variant="outline" className="rounded-none px-2 py-0.5 text-xs">
				Not sent
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-none px-2 py-0.5 font-bold text-xs",
				statusTone[status],
			)}
		>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</Badge>
	);
}

export const certificateParticipantsColumns: ColumnDef<CertificateParticipant>[] =
	[
		{
			accessorKey: "attendee_name",
			header: "Participant",
			cell: ({ row }) => (
				<div className="text-sm">
					<p className="font-medium">{row.original.attendee_name}</p>
					<p className="text-muted-foreground text-xs">
						{row.original.attendee_email || "-"}
					</p>
				</div>
			),
		},
		{
			accessorKey: "ticket_type",
			header: "Ticket Type",
			cell: ({ row }) => (
				<span className="text-sm">{row.original.ticket_type || "-"}</span>
			),
		},
		{
			accessorKey: "certificate_status",
			header: "Certificate",
			cell: ({ row }) => (
				<StatusBadge status={row.original.certificate_status} />
			),
			// Treat a null status as "not_sent" so it can be filtered like the rest.
			filterFn: (row, _columnId, filterValue: string) => {
				const status = row.original.certificate_status ?? "not_sent";
				return status === filterValue;
			},
		},
		{
			accessorKey: "certificate_sent_at",
			header: "Sent At",
			cell: ({ row }) => {
				const sentAt = row.original.certificate_sent_at;
				if (!sentAt) {
					return <span className="text-muted-foreground text-xs">-</span>;
				}
				const d = new Date(sentAt);
				return (
					<div className="text-xs">
						<p className="font-medium">
							{d.toLocaleString("en-US", { dateStyle: "medium" })}
						</p>
						<p className="text-muted-foreground">
							{d.toLocaleString("en-US", { timeStyle: "short" })}
						</p>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row, table }) => {
				const meta = table.options.meta as
					| CertificateParticipantsTableMeta
					| undefined;
				const participant = row.original;
				if (!meta) return null;

				const isSent = Boolean(participant.certificate_status);
				const sending = meta.pendingSendId === participant.public_id;
				const downloading = meta.pendingDownloadId === participant.public_id;

				return (
					<div className="inline-flex items-center border border-border bg-white">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 rounded-none border-border border-r text-green-600 hover:text-green-700"
									onClick={() => meta.onDownload(participant)}
									disabled={downloading}
									aria-label="Download certificate"
								>
									{downloading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Download className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent className="rounded-none">
								Download certificate
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 rounded-none text-orange-500 hover:text-orange-600"
									onClick={() => meta.onSend(participant)}
									disabled={sending}
									aria-label={
										isSent ? "Resend certificate" : "Send certificate"
									}
								>
									{sending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Send className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent className="rounded-none">
								{isSent ? "Resend certificate" : "Send certificate"}
							</TooltipContent>
						</Tooltip>
					</div>
				);
			},
		},
	];
