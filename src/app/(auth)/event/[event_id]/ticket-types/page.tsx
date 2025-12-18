"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { DataTable } from "@/components/pages/ticket-types/ticket-type-table";
import { TicketTypePageButton } from "@/components/pages/ticket-types/page-action/button";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventTicketTypes } from "@/lib/api/ticket-type";

export default function TicketTypesPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(
		<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
			<TicketTypePageButton eventId={event_id} />
		</div>,
	);

	const {
		data: ticketTypes,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", event_id, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId: event_id }),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading ticket types..."
					description="Please wait while we fetch your ticket types..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load ticket types"
					description={
						error?.message || "We couldn't load ticket types. Please try again."
					}
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<DataTable data={ticketTypes || []} />
			)}
		</div>
	);
}
