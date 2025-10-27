"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { columns } from "@/components/pages/tickets/columns";
import { DataTable } from "@/components/pages/tickets/data-table";
import { TicketPageButton } from "@/components/pages/tickets/page-action/button";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventTickets } from "@/lib/api/ticket";

export default function TicketsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<TicketPageButton />);

	const {
		data: tickets,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", event_id, "tickets"],
		queryFn: () => getEventTickets(event_id),
	});

	return (
		<div className="container mx-auto">
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
				<DataTable columns={columns} data={(tickets || []).map(t => ({ ...t, phone: t.phone || '' }))} />
			)}
		</div>
	);
}
