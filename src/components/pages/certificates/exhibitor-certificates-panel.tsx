"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	downloadAllExhibitorCertificates,
	downloadExhibitorCertificate,
	getExhibitorCertificates,
	sendExhibitorCertificates,
	sendOneExhibitorCertificate,
} from "@/lib/api/certificate";
import type { ExhibitorCertificatesTableMeta } from "./exhibitor-certificates-columns";
import { ExhibitorCertificatesTable } from "./exhibitor-certificates-table";

function saveBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

const onError = (fallback: string) => (e: unknown) =>
	toast.error(e instanceof Error ? e.message : fallback);

/** Manual send & download of exhibitor certificates, one per company. */
export function ExhibitorCertificatesPanel({
	eventId,
	canSend,
}: {
	eventId: string;
	canSend: boolean;
}) {
	const queryClient = useQueryClient();
	const key = ["event", eventId, "exhibitor-certificates"];
	const [pendingSendId, setPendingSendId] = useState<number | null>(null);
	const [pendingDownloadId, setPendingDownloadId] = useState<number | null>(
		null,
	);

	const {
		data: rows,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: key,
		queryFn: () => getExhibitorCertificates(eventId),
	});

	const refresh = () => queryClient.invalidateQueries({ queryKey: key });

	const sendOne = useMutation({
		mutationFn: (exhibitorId: number) =>
			sendOneExhibitorCertificate(eventId, exhibitorId),
		onMutate: setPendingSendId,
		onSuccess: () => {
			toast.success("Certificate queued for sending");
			refresh();
		},
		onError: onError("Failed to send certificate"),
		onSettled: () => setPendingSendId(null),
	});

	const sendAll = useMutation({
		mutationFn: () => sendExhibitorCertificates(eventId, true),
		onSuccess: (res) => {
			toast.success(
				`Queued ${res.queued}${res.skipped_no_email ? `, ${res.skipped_no_email} skipped (no email)` : ""}`,
			);
			refresh();
		},
		onError: onError("Failed to send certificates"),
	});

	const downloadOne = useMutation({
		mutationFn: async (row: { id: number; name: string }) => ({
			blob: await downloadExhibitorCertificate(eventId, row.id),
			name: row.name,
		}),
		onMutate: (row) => setPendingDownloadId(row.id),
		onSuccess: ({ blob, name }) =>
			saveBlob(blob, `certificate-${name.replace(/\s+/g, "-")}.pdf`),
		onError: onError("Failed to download certificate"),
		onSettled: () => setPendingDownloadId(null),
	});

	const downloadAll = useMutation({
		mutationFn: () => downloadAllExhibitorCertificates(eventId),
		onSuccess: (blob) => saveBlob(blob, "exhibitor-certificates.pdf"),
		onError: onError("Failed to download certificates"),
	});

	if (isLoading)
		return <LoadingState title="Loading exhibitors..." height="h-64" />;
	if (error) {
		return (
			<ErrorState
				title="Failed to load exhibitors"
				description="We couldn't fetch the exhibitor list. Please try again."
				height="h-64"
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	const list = rows ?? [];
	const hasRows = list.length > 0;

	const tableMeta: ExhibitorCertificatesTableMeta = {
		onSend: (row) => {
			if (!canSend) {
				toast.error("Mark the exhibitor template as ready before sending.");
				return;
			}
			sendOne.mutate(row.exhibitor_id);
		},
		onDownload: (row) =>
			downloadOne.mutate({
				id: row.exhibitor_id,
				name: row.company_name ?? `exhibitor-${row.exhibitor_id}`,
			}),
		pendingSendId,
		pendingDownloadId,
	};

	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between gap-4">
				<p className="min-w-0 text-muted-foreground text-sm">
					One certificate per company with a paid or waived booking. Nothing is
					sent until you press send.
				</p>
				<div className="flex shrink-0 gap-2">
					<Button
						variant="outline"
						size="sm"
						className="rounded-none"
						onClick={() => refetch()}
						title="Refresh delivery status"
					>
						<RefreshCw className="mr-1 h-4 w-4" />
						Refresh
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="rounded-none"
						onClick={() => downloadAll.mutate()}
						disabled={!hasRows || !canSend || downloadAll.isPending}
						title="Download all certificates as one PDF"
					>
						<Download className="mr-1 h-4 w-4" />
						{downloadAll.isPending ? "Preparing..." : "Download all"}
					</Button>
					<Button
						size="sm"
						className="rounded-none"
						onClick={() => sendAll.mutate()}
						disabled={!hasRows || !canSend || sendAll.isPending}
						title={
							canSend
								? "Send to every company that has not received one"
								: "Mark the exhibitor template as ready before sending"
						}
					>
						<Send className="mr-1 h-4 w-4" />
						Send to all unsent
					</Button>
				</div>
			</div>

			{!canSend && hasRows && (
				<div className="border border-dashed bg-muted/40 px-3 py-2 text-muted-foreground text-xs">
					The exhibitor template is not ready yet. Design it above and choose
					&ldquo;Save &amp; mark ready&rdquo; to enable sending.
				</div>
			)}

			{hasRows ? (
				<ExhibitorCertificatesTable data={list} meta={tableMeta} />
			) : (
				<EmptyState
					title="No eligible exhibitors"
					description="Companies appear here once they have a paid or waived booking."
					height="h-64"
				/>
			)}
		</div>
	);
}
