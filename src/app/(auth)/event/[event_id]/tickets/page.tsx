"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { DataTable } from "@/components/pages/tickets/event-ticket-table";
import { TicketPageButton } from "@/components/pages/tickets/page-action/create-event-ticket-button";
import { ImportTicketButton } from "@/components/pages/tickets/page-action/import-ticket";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventTickets } from "@/lib/api/ticket";

type TicketFilter = "active" | "archived" | "all";

export default function TicketsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const [ticketFilter, setTicketFilter] = useState<TicketFilter>("active");

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<ImportTicketButton />
				<TicketPageButton />
			</div>
		),
		[],
	);

	useSetEventActions(eventActions);

	// Build query options based on filter
	const queryOptions = useMemo(() => {
		if (ticketFilter === "all") {
			return { full: true };
		}
		if (ticketFilter === "archived") {
			return { archived: true };
		}
		return undefined; // Default: active tickets only
	}, [ticketFilter]);

	const {
		data: tickets,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", event_id, "tickets", ticketFilter],
		queryFn: () => getEventTickets(event_id, queryOptions),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading tickets..."
					description="Please wait while we fetch your tickets..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load tickets"
					description={
						error?.message || "We couldn't load tickets. Please try again."
					}
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<DataTable
					data={(tickets || []).map((t) => ({ ...t, phone: t.phone || "" }))}
					ticketFilter={ticketFilter}
					onTicketFilterChange={setTicketFilter}
				/>
			)}
		</div>
	);
}
