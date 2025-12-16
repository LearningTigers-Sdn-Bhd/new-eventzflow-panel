"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { PendingTicketPageButton } from "@/components/pages/pending-ticket/page-action/create-pending-ticket-button";
import { DataTable } from "@/components/pages/pending-ticket/pending-ticket-table";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getPendingTickets } from "@/lib/api/event/pending";

export default function PendingTicketsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<PendingTicketPageButton />);

	const {
		data: pendingTickets = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", event_id, "pending-tickets"],
		queryFn: () => getPendingTickets({ eventId: event_id }),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading pending tickets..."
					description="Please wait while we fetch your pending tickets..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load pending tickets"
					description="We couldn't load pending tickets. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable data={pendingTickets} />
			)}
		</div>
	);
}
