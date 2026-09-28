"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { RfidClientWrapper } from "@/components/pages/rfid/rfid-client-wrapper";
import { Button } from "@/components/ui/button";
import {
	getRfidBindings,
	getRfidStations,
	getRfidSummary,
} from "@/lib/api/rfid";

export default function RfidPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	const summaryQuery = useQuery({
		queryKey: ["event", event_id, "rfid", "summary"],
		queryFn: () => getRfidSummary(event_id),
	});
	const stationsQuery = useQuery({
		queryKey: ["event", event_id, "rfid", "stations"],
		queryFn: () => getRfidStations(event_id),
	});
	const bindingsQuery = useQuery({
		queryKey: ["event", event_id, "rfid", "bindings"],
		queryFn: () => getRfidBindings(event_id),
	});

	const isLoading =
		summaryQuery.isLoading ||
		stationsQuery.isLoading ||
		bindingsQuery.isLoading;
	const error =
		summaryQuery.error ?? stationsQuery.error ?? bindingsQuery.error;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading RFID data..."
				description="Please wait while we fetch headcount, stations, and bindings..."
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
					stations={stationsQuery.data?.stations ?? []}
					bindings={bindingsQuery.data?.bindings ?? []}
				/>
			)}
		</div>
	);
}
