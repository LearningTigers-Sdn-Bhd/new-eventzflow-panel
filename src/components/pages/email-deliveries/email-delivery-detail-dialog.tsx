"use client";

import { useQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/data-state";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getEmailDelivery } from "@/lib/api/email-delivery";

interface EmailDeliveryDetailDialogProps {
	deliveryId: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EmailDeliveryDetailDialog({
	deliveryId,
	open,
	onOpenChange,
}: EmailDeliveryDetailDialogProps) {
	const { data, isLoading } = useQuery({
		queryKey: ["email-delivery", deliveryId],
		queryFn: () => getEmailDelivery(deliveryId as number),
		enabled: open && deliveryId !== null,
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto rounded-none sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Email Delivery #{deliveryId}</DialogTitle>
					<DialogDescription>
						Inspect email log details, failures, and retry metadata.
					</DialogDescription>
				</DialogHeader>

				{isLoading || !data ? (
					<LoadingState
						title="Loading delivery details..."
						description="Please wait while we fetch this email log."
						height="h-48"
					/>
				) : (
					<div className="space-y-3 text-sm">
						<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
							<p>
								<strong>Status:</strong> {data.status}
							</p>
							<p>
								<strong>Provider:</strong> {data.provider}
							</p>
							<p>
								<strong>Mailer:</strong> {data.mailerName}.{data.mailerAction}
							</p>
							<p>
								<strong>Recipient:</strong> {data.recipient || "-"}
							</p>
							<p>
								<strong>Provider ID:</strong> {data.providerMessageId || "-"}
							</p>
							<p>
								<strong>Failure Reason:</strong> {data.failureReason || "-"}
							</p>
							<p>
								<strong>Retry Count:</strong> {data.retryCount}
							</p>
							<p>
								<strong>Next Retry:</strong> {data.nextRetryAt || "-"}
							</p>
							<p>
								<strong>Related:</strong> {data.relatedType || "-"} #
								{data.relatedId || "-"}
							</p>
							<p>
								<strong>Resend Of:</strong> {data.resendOfId || "-"}
							</p>
						</div>
						<div>
							<p className="font-semibold">Subject</p>
							<p className="text-muted-foreground">{data.subject || "-"}</p>
						</div>
						<div>
							<p className="font-semibold">Recipients</p>
							<p className="text-muted-foreground">
								To: {(data.recipients.to || []).join(", ") || "-"}
							</p>
							<p className="text-muted-foreground">
								Cc: {(data.recipients.cc || []).join(", ") || "-"}
							</p>
							<p className="text-muted-foreground">
								Bcc: {(data.recipients.bcc || []).join(", ") || "-"}
							</p>
						</div>
						<div>
							<p className="font-semibold">Error</p>
							<p className="whitespace-pre-wrap text-muted-foreground">
								{data.lastError || "-"}
							</p>
						</div>
						<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
							<p>
								<strong>Created:</strong>{" "}
								{new Date(data.createdAt).toLocaleString()}
							</p>
							<p>
								<strong>Updated:</strong>{" "}
								{new Date(data.updatedAt).toLocaleString()}
							</p>
							<p>
								<strong>Sent:</strong>{" "}
								{data.sentAt ? new Date(data.sentAt).toLocaleString() : "-"}
							</p>
							<p>
								<strong>Delivered:</strong>{" "}
								{data.deliveredAt
									? new Date(data.deliveredAt).toLocaleString()
									: "-"}
							</p>
							<p>
								<strong>Failed:</strong>{" "}
								{data.failedAt ? new Date(data.failedAt).toLocaleString() : "-"}
							</p>
							<p>
								<strong>Bounced:</strong>{" "}
								{data.bouncedAt
									? new Date(data.bouncedAt).toLocaleString()
									: "-"}
							</p>
							<p>
								<strong>Complained:</strong>{" "}
								{data.complainedAt
									? new Date(data.complainedAt).toLocaleString()
									: "-"}
							</p>
							<p>
								<strong>Suppressed:</strong>{" "}
								{data.suppressedAt
									? new Date(data.suppressedAt).toLocaleString()
									: "-"}
							</p>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
