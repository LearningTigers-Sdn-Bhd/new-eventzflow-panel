"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { VisitorsDataTable } from "@/components/pages/visitors/event-visitor-table";
import { CreateEventVisitorButton } from "@/components/pages/visitors/page-action/create-event-visitor-button";
import { JsonSampleTool } from "@/components/json-sample-tool";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getVisitors } from "@/lib/api/visitor";

const VISITOR_BASE_FIELDS = [
	"full_name",
	"email",
	"phone",
	"gender",
	"age",
	"role",
];

export default function VisitorsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const eventId = Number(event_id);

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<JsonSampleTool 
					resourceName="Visitor" 
					eventId={event_id} 
					baseFields={VISITOR_BASE_FIELDS} 
				/>
				<CreateEventVisitorButton eventId={eventId} />
			</div>
		),
		[event_id, eventId],
	);

	useSetEventActions(eventActions);

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
