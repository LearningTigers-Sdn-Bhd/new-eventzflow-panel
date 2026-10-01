"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { RfidClientWrapper } from "@/components/pages/rfid/rfid-client-wrapper";
import { Button } from "@/components/ui/button";
import { getRfidStations, getRfidSummary } from "@/lib/api/rfid";

export default function RfidPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	// Narrows the dashboard's attendance figures to one ticket type.
	const [ticketType, setTicketType] = useState("");

	const summaryQuery = useQuery({
		queryKey: ["event", event_id, "rfid", "summary", ticketType],
		queryFn: () => getRfidSummary(event_id, ticketType),
		placeholderData: (previous) => previous,
		refetchInterval: 10_000,
	});
	const stationsQuery = useQuery({
		queryKey: ["event", event_id, "rfid", "stations"],
		queryFn: () => getRfidStations(event_id),
		refetchInterval: 10_000,
	});

	const isLoading = summaryQuery.isLoading || stationsQuery.isLoading;
	const error = summaryQuery.error ?? stationsQuery.error;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading RFID data..."
				description="Please wait while we fetch headcount and stations..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load RFID data"
				description="We couldn't load the RFID overview. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="space-y-6 p-0">
			{summaryQuery.data && (
				<RfidClientWrapper
					eventId={event_id}
					summary={summaryQuery.data}
					summaryTicketType={ticketType}
					onSummaryTicketTypeChange={setTicketType}
					stations={stationsQuery.data?.stations ?? []}
				/>
			)}
		</div>
	);
}
