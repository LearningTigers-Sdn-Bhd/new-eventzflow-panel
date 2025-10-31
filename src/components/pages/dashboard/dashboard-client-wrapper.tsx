"use client";

import { useQueries } from "@tanstack/react-query";
import { List } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
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
				<div className="border-t border-dashed">
					<div className="flex w-full flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between md:gap-1">
						<div className="px-2 md:px-4">
							<IconTitle
								icon={List}
								title="All Events Overview"
								description="Quick view of all your events and their performance"
							/>
						</div>
						<div className="w-full px-0 md:w-auto md:px-4">
							<EventSwitcher
								currentEventId={selectedEventId}
								onEventChange={setSelectedEventId}
								initialEvents={events}
							/>
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
				</div>
			)}

			{/* Individual Event Analytics */}
			{selectedEventId && (
				<div className="border-t border-dashed">
					<div className="flex w-full flex-col gap-4 pt-8 pb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-1">
						<div className="px-2 md:px-4">
							<IconTitle
								icon={List}
								title="Event Analytics"
								description="Detailed insights and metrics for this event"
							/>
						</div>
						<div className="flex w-full flex-col px-0 md:w-auto md:px-4">
							<EventSwitcher
								currentEventId={selectedEventId}
								onEventChange={setSelectedEventId}
								initialEvents={events}
							/>
						</div>
					</div>
					<div className="border-t border-dashed">
						<EventAnalytics
							eventId={selectedEventId}
							onBack={() => setSelectedEventId(null)}
							showBackButton={false}
						/>
					</div>
				</div>
			)}
		</>
	);
}
