"use client";

import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { getAllEventsStats, getEventsOverview } from "@/lib/api/dashboard";
import type { EventOverview } from "@/lib/api/dashboard/response";
import { AllEventsOverview } from "./all-events-overview";
import { EventAnalytics } from "./event-analytics";
import { EventSwitcher } from "./event-switcher";
import { EventsOverviewSkeleton } from "./events-overview-skeleton";

interface DashboardClientWrapperProps {
	initialStats?: {
		totalEvents: number;
		activeEvents: number;
		totalTickets: number;
		totalRevenue: number;
		totalCheckins: number;
		totalLocations: number;
	};
	initialEvents?: EventOverview[];
}

export function DashboardClientWrapper({
	initialStats,
	initialEvents,
}: DashboardClientWrapperProps) {
	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
	const isHydrated = useHydratedStore();

	const [
		{ data: stats, isLoading: statsLoading, error: statsError },
		{ data: events, isLoading: eventsLoading, error: eventsError },
	] = useQueries({
		queries: [
			{
				queryKey: ["dashboard-stats"],
				queryFn: getAllEventsStats,
				initialData: initialStats,
				enabled: isHydrated, // Only fetch when store is hydrated
			},
			{
				queryKey: ["events-overview"],
				queryFn: getEventsOverview,
				initialData: initialEvents,
				enabled: isHydrated, // Only fetch when store is hydrated
			},
		],
	});

	return (
		<>
			{/* All Events Overview Section */}
			{!selectedEventId && (
				<>
					<div className="space-y-4">
						<Separator />
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1">
								<h2 className="font-semibold text-xl">All Events Overview</h2>
								<p className="mt-1 text-muted-foreground text-sm">
									Quick view of all your events and their performance
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="hidden text-right sm:block">
									<p className="font-medium text-sm">Switch Event</p>
									<p className="text-muted-foreground text-xs">
										Select to view details
									</p>
								</div>
								<EventSwitcher
									currentEventId={selectedEventId}
									onEventChange={setSelectedEventId}
									initialEvents={events}
								/>
							</div>
						</div>
					</div>
					{eventsLoading && !initialEvents ? (
						<EventsOverviewSkeleton />
					) : eventsError ? (
						<ErrorState
							title="Failed to load events"
							description="We couldn't load your events data. Please try again."
							action={
								<Button onClick={() => window.location.reload()}>Retry</Button>
							}
						/>
					) : (
						<AllEventsOverview
							onEventSelect={setSelectedEventId}
							events={events}
							isLoading={eventsLoading}
							error={eventsError}
						/>
					)}
				</>
			)}

			{/* Individual Event Analytics */}
			{selectedEventId && (
				<>
					<div className="space-y-4">
						<Separator />
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1">
								<h2 className="font-semibold text-xl">Event Analytics</h2>
								<p className="mt-1 text-muted-foreground text-sm">
									Detailed insights and metrics for this event
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="hidden text-right sm:block">
									<p className="font-medium text-sm">Switch Event</p>
									<p className="text-muted-foreground text-xs">
										View different event
									</p>
								</div>
								<EventSwitcher
									currentEventId={selectedEventId}
									onEventChange={setSelectedEventId}
									initialEvents={events}
								/>
							</div>
						</div>
					</div>
					<EventAnalytics
						eventId={selectedEventId}
						onBack={() => setSelectedEventId(null)}
						showBackButton={false}
					/>
				</>
			)}
		</>
	);
}
