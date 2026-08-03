"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	type CertificateParticipant,
	downloadAllCertificates,
	downloadCertificate,
	getCertificateParticipants,
	sendOneCertificate,
} from "@/lib/api/certificate";
import {
	type CertificateParticipantsTableMeta,
	certificateParticipantsColumns,
} from "./certificate-participants-columns";
import { CertificateParticipantsTable } from "./certificate-participants-table";
import { SendCertificatesPanel } from "./send-certificates-panel";

type CertificateParticipantsProps = {
	eventId: string;
	/** When false, the template isn't ready so sending is disabled. */
	canSend: boolean;
};

export function CertificateParticipants({
	eventId,
	canSend,
}: CertificateParticipantsProps) {
	const queryClient = useQueryClient();
	const [pendingSendId, setPendingSendId] = useState<string | null>(null);
	const [pendingDownloadId, setPendingDownloadId] = useState<string | null>(
		null,
	);
	const [sendDialogOpen, setSendDialogOpen] = useState(false);

	const queryKey = ["event", eventId, "certificate-participants"];

	const { data, isLoading, error, refetch } = useQuery({
		queryKey,
		queryFn: () => getCertificateParticipants(eventId),
	});

	const sendMutation = useMutation({
		mutationFn: (publicId: string) => sendOneCertificate(eventId, publicId),
		onMutate: (publicId: string) => setPendingSendId(publicId),
		onSuccess: () => {
			toast.success("Certificate has been queued for sending.");
			queryClient.invalidateQueries({ queryKey });
		},
		onError: (e: unknown) =>
			toast.error(
				e instanceof Error ? e.message : "Failed to send certificate",
			),
		onSettled: () => setPendingSendId(null),
	});

	const downloadMutation = useMutation({
		mutationFn: (participant: CertificateParticipant) =>
			downloadCertificate(eventId, { ticketId: participant.public_id }),
		onMutate: (participant: CertificateParticipant) =>
			setPendingDownloadId(participant.public_id),
		onSuccess: (blob, participant) => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `certificate-${participant.attendee_name.replace(/\s+/g, "-")}.pdf`;
			a.click();
			URL.revokeObjectURL(url);
		},
		onError: (e: unknown) =>
			toast.error(
				e instanceof Error ? e.message : "Failed to download certificate",
			),
		onSettled: () => setPendingDownloadId(null),
	});

	const downloadAllMutation = useMutation({
		mutationFn: () => downloadAllCertificates(eventId, "all"),
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "certificates.pdf";
			a.click();
			URL.revokeObjectURL(url);
		},
		onError: (e: unknown) =>
			toast.error(
				e instanceof Error ? e.message : "Failed to download certificates",
			),
	});

	if (isLoading) {
		return <LoadingState title="Loading participants..." height="h-64" />;
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load participants"
				description="We couldn't fetch the participant list. Please try again."
				height="h-64"
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	const tableMeta: CertificateParticipantsTableMeta = {
		onSend: (participant) => {
			if (!canSend) {
				toast.error("Mark the certificate template as ready before sending.");
				return;
			}
			sendMutation.mutate(participant.public_id);
		},
		onDownload: (participant) => downloadMutation.mutate(participant),
		pendingSendId,
		pendingDownloadId,
	};

	const allParticipants = data ?? [];
	const hasParticipants = allParticipants.length > 0;
	// The tracking table only lists participants who have actually been sent a
	// certificate (any delivery status). Not-yet-sent attendees are issued via
	// the "Send certificates" dialog, not shown here.
	const sentParticipants = allParticipants.filter(
		(p) => p.certificate_status != null,
	);
	const hasSent = sentParticipants.length > 0;

	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between gap-4">
				<p className="min-w-0 text-muted-foreground text-sm">
					Track which participants have received their certificate, send to
					everyone at once, or resend to an individual.
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
						onClick={() => downloadAllMutation.mutate()}
						disabled={!hasParticipants || downloadAllMutation.isPending}
						title="Download all certificates as one PDF"
					>
						<Download className="mr-1 h-4 w-4" />
						{downloadAllMutation.isPending ? "Preparing..." : "Download all"}
					</Button>
					<Button
						size="sm"
						className="rounded-none"
						onClick={() => setSendDialogOpen(true)}
						disabled={!hasParticipants || !canSend}
						title={
							canSend
								? "Send certificates to attendees"
								: "Mark the certificate template as ready before sending"
						}
					>
						<Send className="mr-1 h-4 w-4" />
						Send certificates
					</Button>
				</div>
			</div>

			{!canSend && hasParticipants && (
				<div className="border border-dashed bg-muted/40 px-3 py-2 text-muted-foreground text-xs">
					Your certificate template is still a draft. Go to the{" "}
					<span className="font-medium">Design Certificate</span> tab and choose
					&ldquo;Save &amp; mark ready&rdquo; to enable sending.
				</div>
			)}

			{!hasSent ? (
				<EmptyState
					title="No certificates sent yet"
					description={
						hasParticipants
							? "Use \u201cSend certificates\u201d to issue them. Participants will appear here once a certificate has been sent."
							: "Ticket holders with an email address will appear here once they register and receive a certificate."
					}
					height="h-64"
				/>
			) : (
				<CertificateParticipantsTable
					columns={certificateParticipantsColumns}
					data={sentParticipants}
					meta={tableMeta}
				/>
			)}

			<Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto rounded-none sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Send certificates</DialogTitle>
						<DialogDescription>
							Choose who receives a certificate. You can exclude individual
							attendees before sending.
						</DialogDescription>
					</DialogHeader>
					<SendCertificatesPanel
						eventId={eventId}
						onClose={() => setSendDialogOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default CertificateParticipants;
