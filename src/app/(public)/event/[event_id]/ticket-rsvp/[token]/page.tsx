"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { use } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	confirmTicketRsvp,
	declineTicketRsvp,
	getTicketRsvp,
} from "@/lib/api/ticket-rsvp";

export default function TicketRsvpPage({
	params,
}: {
	params: Promise<{ event_id: string; token: string }>;
}) {
	const { event_id, token } = use(params);
	const queryClient = useQueryClient();

	const { data, isLoading, isError } = useQuery({
		queryKey: ["public-ticket-rsvp", event_id, token],
		queryFn: () => getTicketRsvp({ eventId: event_id, token }),
	});

	const confirmMutation = useMutation({
		mutationFn: () => confirmTicketRsvp({ eventId: event_id, token }),
		onSuccess: () => {
			toast.success("RSVP confirmed. Your QR ticket will be sent by email.");
			queryClient.invalidateQueries({
				queryKey: ["public-ticket-rsvp", event_id, token],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to confirm RSVP");
		},
	});

	const declineMutation = useMutation({
		mutationFn: () => declineTicketRsvp({ eventId: event_id, token }),
		onSuccess: () => {
			toast.success("RSVP declined");
			queryClient.invalidateQueries({
				queryKey: ["public-ticket-rsvp", event_id, token],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to decline RSVP");
		},
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading RSVP details..."
				description="Please wait while we prepare your RSVP page."
			/>
		);
	}

	if (isError || !data) {
		return (
			<div className="mx-auto max-w-2xl px-6 py-10">
				<ErrorState
					title="Unable to load RSVP"
					description="This RSVP link is invalid or unavailable."
				/>
			</div>
		);
	}

	const rsvpStatus = data.data.rsvp_status;
	const isLocked = rsvpStatus === "confirmed" || rsvpStatus === "expired";

	return (
		<div className="mx-auto max-w-2xl px-6 py-10">
			<Card className="rounded-none">
				<CardHeader>
					<CardTitle className="text-xl">{data.data.event_title}</CardTitle>
					<CardDescription>
						Delegate RSVP confirmation for {data.data.attendee_name}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-sm">
					<div className="flex items-center gap-2">
						<Mail className="size-4 text-muted-foreground" />
						<span>{data.data.attendee_email || "No email"}</span>
					</div>
					<div>
						<span className="font-medium">Application status:</span>{" "}
						{data.data.review_status}
					</div>
					<div>
						<span className="font-medium">RSVP status:</span> {rsvpStatus}
					</div>
					{data.data.rsvp_expires_at && (
						<div>
							<span className="font-medium">Expires at:</span>{" "}
							{new Date(data.data.rsvp_expires_at).toLocaleString()}
						</div>
					)}
					{rsvpStatus === "confirmed" && (
						<div className="flex items-center gap-2 text-green-600">
							<CheckCircle2 className="size-4" />
							RSVP already confirmed.
						</div>
					)}
				</CardContent>
				<CardFooter className="flex gap-2">
					<Button
						type="button"
						className="rounded-none"
						onClick={() => confirmMutation.mutate()}
						disabled={
							isLocked || confirmMutation.isPending || declineMutation.isPending
						}
					>
						{confirmMutation.isPending ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Confirming...
							</>
						) : (
							"Confirm RSVP"
						)}
					</Button>
					<Button
						type="button"
						variant="outline"
						className="rounded-none"
						onClick={() => declineMutation.mutate()}
						disabled={
							isLocked || confirmMutation.isPending || declineMutation.isPending
						}
					>
						{declineMutation.isPending ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Declining...
							</>
						) : (
							"Decline"
						)}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
