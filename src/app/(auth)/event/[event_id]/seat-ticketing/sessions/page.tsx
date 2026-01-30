"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { SeatSessionCreateButton } from "@/components/pages/seat-ticketing/session/seat-session-create-button";
import { SeatSessionTable } from "@/components/pages/seat-ticketing/session/seat-session-table";
import { columns } from "@/components/pages/seat-ticketing/session/seat-session-table-columns";
import type { SeatSessionFilter } from "@/components/pages/seat-ticketing/session/seat-session-table-control";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getSeatSessions } from "@/lib/api/seat-ticketing";

export default function SeatSessionsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user } = useAuth();
	const [sessionFilter, setSessionFilter] = useState<SeatSessionFilter>(
		"active",
	);

	const isVendor = user?.role === "vendor";

	useSetEventActions(isVendor ? null : <SeatSessionCreateButton />);

	const queryOptions = useMemo(() => {
		if (sessionFilter === "all") {
			return { full: true } as const;
		}
		if (sessionFilter === "archived") {
			return { archived: true } as const;
		}
		return undefined;
	}, [sessionFilter]);

	const {
		data: sessions,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["seat-ticketing", "sessions", event_id, sessionFilter],
		queryFn: () =>
			getSeatSessions({
				eventId: event_id,
				...queryOptions,
			}),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading seat sessions..."
					description="Please wait while we fetch your sessions..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load seat sessions"
					description={
						error?.message ||
						"We couldn't load seat sessions. Please try again."
					}
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<SeatSessionTable
					columns={columns}
					data={(sessions || []).map((session) => ({
						...session,
						id: session.id.toString(),
						status: session.status ?? "draft",
						archived: session.archived,
					}))}
					sessionFilter={sessionFilter}
					onSessionFilterChange={setSessionFilter}
				/>
			)}
		</div>
	);
}
