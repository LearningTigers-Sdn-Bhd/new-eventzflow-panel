"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExhibitorCertificateRow } from "@/lib/api/certificate";
import { StatusBadge } from "./certificate-participants-columns";

export interface ExhibitorCertificatesTableMeta {
	onSend: (row: ExhibitorCertificateRow) => void;
	onDownload: (row: ExhibitorCertificateRow) => void;
	pendingSendId: number | null;
	pendingDownloadId: number | null;
}

export const exhibitorCertificatesColumns: ColumnDef<ExhibitorCertificateRow>[] =
	[
		{
			accessorKey: "company_name",
			header: "Company",
			cell: ({ row }) => (
				<div className="text-sm">
					<p className="font-medium">
						{row.original.company_name ??
							`Exhibitor ${row.original.exhibitor_id}`}
					</p>
					<p className="text-muted-foreground text-xs">
						{row.original.email || "No email"}
					</p>
				</div>
			),
		},
		{
			accessorKey: "booth_count",
			header: "Booths",
			cell: ({ row }) => (
				<div className="text-sm">
					<p>{row.original.booth_count}</p>
					{row.original.booth_numbers && (
						<p className="text-muted-foreground text-xs">
							{row.original.booth_numbers}
						</p>
					)}
				</div>
			),
		},
		{
			accessorKey: "certificate_status",
			header: "Certificate",
			cell: ({ row }) => (
				<StatusBadge status={row.original.certificate_status} />
			),
			// A null status counts as "not_sent" so it filters like the rest.
			filterFn: (row, _columnId, filterValue: string) =>
				(row.original.certificate_status ?? "not_sent") === filterValue,
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
					| ExhibitorCertificatesTableMeta
					| undefined;
				const item = row.original;
				if (!meta) return null;

				const isSent = Boolean(item.certificate_status);
				const sending = meta.pendingSendId === item.exhibitor_id;
				const downloading = meta.pendingDownloadId === item.exhibitor_id;

				return (
					<div className="inline-flex items-center border border-border bg-white">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 rounded-none border-border border-r text-green-600 hover:text-green-700"
									onClick={() => meta.onDownload(item)}
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
									onClick={() => meta.onSend(item)}
									disabled={sending || !item.email}
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
								{item.email
									? isSent
										? "Resend certificate"
										: "Send certificate"
									: "No email on file"}
							</TooltipContent>
						</Tooltip>
					</div>
				);
			},
		},
	];
