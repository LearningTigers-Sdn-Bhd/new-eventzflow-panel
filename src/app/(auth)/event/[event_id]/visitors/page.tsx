"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { VisitorsDataTable } from "@/components/pages/visitors/data-table";
import { VisitorsPageButton } from "@/components/pages/visitors/page-action/button";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getVisitors } from "@/lib/api/visitor";

export default function VisitorsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const eventId = Number(event_id);

	useSetEventActions(<VisitorsPageButton eventId={eventId} />);

	const {
		data: visitors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "visitors"],
		queryFn: () => getVisitors(eventId),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading visitors..."
					description="Please wait while we fetch event visitors..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load visitors"
					description="We couldn't load the event visitors. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<VisitorsDataTable eventId={eventId} data={visitors || []} />
			)}
		</div>
	);
}
