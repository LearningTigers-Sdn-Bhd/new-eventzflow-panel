"use client";

import { use, useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { DataTable } from "@/components/pages/event-leads/lead-log-table";
import { ScanLeadButton } from "@/components/pages/event-leads/page-action/scan-lead-button";
import { Button } from "@/components/ui/button";
import { useEventLeads } from "@/hooks/use-event-leads";
import { useSetEventActions } from "@/hooks/use-set-event-actions";

interface EventLeadsPageProps {
	params: Promise<{ event_id: string }>;
}

export default function EventLeadsPage({ params }: EventLeadsPageProps) {
	const { event_id } = use(params);

	const {
		data: eventLeads,
		isLoading,
		error,
		refetch,
	} = useEventLeads(event_id);

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<ScanLeadButton eventId={event_id} onRefetch={refetch} />
			</div>
		),
		[event_id, refetch],
	);

	useSetEventActions(eventActions);

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading event leads..."
					description="Please wait while we fetch your event leads..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load event leads"
					description="We couldn't load event leads. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable data={eventLeads || []} />
			)}
		</div>
	);
}
