"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { SeatCanvas } from "@/components/pages/seat-ticketing/session-manager/seat-canvas";
import { SeatSessionHeader } from "@/components/pages/seat-ticketing/session-manager/seat-session-header";
import { SeatSessionProvider } from "@/components/pages/seat-ticketing/session-manager/seat-session-provider";
import { SeatSessionSidebar } from "@/components/pages/seat-ticketing/session-manager/seat-session-sidebar";
import { useSeatSessionStore } from "@/components/pages/seat-ticketing/session-manager/use-seat-session-store";
import { VenueCanvas } from "@/components/pages/seat-ticketing/session-manager/venue-canvas";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSeatSession } from "@/lib/api/seat-ticketing";

export default function SeatSessionDetailsPage({
	params,
}: {
	params: Promise<{ event_id: string; "session-id": string }>;
}) {
	const resolvedParams = use(params);
	const sessionId = resolvedParams["session-id"];

	const {
		data: session,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["seat-ticketing", "session", sessionId],
		queryFn: () => getSeatSession({ sessionId }),
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading session details..."
				description="Please wait while we fetch the session information..."
			/>
		);
	}

	if (error || !session) {
		return (
			<ErrorState
				title="Failed to load session"
				description={
					error?.message ||
					"We couldn't load the session details. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<SeatSessionProvider initialSession={session}>
			<SeatSessionLayout />
		</SeatSessionProvider>
	);
}

function SeatSessionLayout() {
	const mode = useSeatSessionStore((state) => state.mode);

	return (
		<div className="flex h-svh w-full flex-col bg-background border rounded-none shadow-sm">
			<SeatSessionHeader />
			<div className="flex flex-1 min-h-0">
				<SidebarProvider className="w-full min-h-0">
					<SeatSessionSidebar />
					<main className="relative flex-1 min-w-0 bg-slate-50">
						<div className="sticky top-16 h-[calc(100svh-4rem)]">
							{mode === "venue_blueprint" ? <VenueCanvas /> : <SeatCanvas />}
						</div>
					</main>
				</SidebarProvider>
			</div>
		</div>
	);
}
