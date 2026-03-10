"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useEffect } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { SeatCanvas } from "@/components/pages/seat-ticketing/session-manager/components/canvas/seat-canvas";
import { VenueCanvas } from "@/components/pages/seat-ticketing/session-manager/components/canvas/venue-canvas";
import { SeatSessionProvider } from "@/components/pages/seat-ticketing/session-manager/providers/seat-session-provider";
import { SeatSessionHeader } from "@/components/pages/seat-ticketing/session-manager/seat-session-header";
import { SeatSessionSidebar } from "@/components/pages/seat-ticketing/session-manager/seat-session-sidebar";
import { useSeatSessionStore } from "@/components/pages/seat-ticketing/session-manager/store/use-seat-session-store";
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
	const save = useSeatSessionStore((state) => state.save);
	const removeSeat = useSeatSessionStore((state) => state.removeSeat);
	const removeSection = useSeatSessionStore((state) => state.removeSection);
	const selectedSeatIds = useSeatSessionStore((state) => state.selectedSeatIds);
	const selectedSectionId = useSeatSessionStore(
		(state) => state.selectedSectionId,
	);

	// Global Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if user is typing in an input
			const isInput =
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement;
			if (isInput) return;

			// Ctrl + S (Save)
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				save();
			}

			// Delete / Backspace (Remove)
			if (e.key === "Delete" || e.key === "Backspace") {
				if (mode === "seat_placement" && selectedSeatIds.length > 0) {
					e.preventDefault();
					for (const id of selectedSeatIds) {
						removeSeat(id);
					}
				} else if (mode === "venue_blueprint" && selectedSectionId) {
					e.preventDefault();
					removeSection(selectedSectionId);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		save,
		removeSeat,
		removeSection,
		selectedSeatIds,
		selectedSectionId,
		mode,
	]);

	return (
		<div className="flex h-svh w-full flex-col rounded-none border bg-background shadow-sm">
			<SeatSessionHeader />
			<div className="flex min-h-0 flex-1">
				<SidebarProvider className="min-h-0 w-full">
					<SeatSessionSidebar />
					<main className="relative min-w-0 flex-1 bg-slate-50">
						<div className="sticky top-16 h-[calc(100svh-4rem)]">
							{mode === "venue_blueprint" ? <VenueCanvas /> : <SeatCanvas />}
						</div>
					</main>
				</SidebarProvider>
			</div>
		</div>
	);
}
