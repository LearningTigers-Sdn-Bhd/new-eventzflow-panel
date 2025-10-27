"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Calendar, Scan, Ticket } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllEventsStats, getEventsOverview } from "@/lib/api/dashboard";
import { EventOverviewCard } from "./event-overview-card";

interface EventsOverviewProps {
	onEventSelect: (eventId: string) => void;
}

export function EventsOverview({ onEventSelect }: EventsOverviewProps) {
	const {
		data: events,
		isLoading: eventsLoading,
		error: eventsError,
	} = useQuery({
		queryKey: ["events-overview"],
		queryFn: getEventsOverview,
	});

	const { data: stats, isLoading: statsLoading } = useQuery({
		queryKey: ["dashboard-stats"],
		queryFn: getAllEventsStats,
	});

	const isLoading = eventsLoading || statsLoading;
	const error = eventsError;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading your events..."
				description="Please wait while we fetch your event data."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load events"
				description="We couldn't load your events. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Overall Stats */}
			{stats && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-muted-foreground text-sm">
										Total Events
									</p>
									<p className="mt-2 font-bold text-2xl">{stats.totalEvents}</p>
									<p className="mt-1 text-muted-foreground text-xs">
										{stats.activeEvents} active
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
									<Calendar className="h-6 w-6 text-blue-500" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-muted-foreground text-sm">
										Total Tickets
									</p>
									<p className="mt-2 font-bold text-2xl">
										{stats.totalTickets.toLocaleString()}
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										{stats.totalTickets.toLocaleString()} tickets
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
									<Ticket className="h-6 w-6 text-purple-500" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-muted-foreground text-sm">
										Total Check-Ins
									</p>
									<p className="mt-2 font-bold text-2xl">
										{stats.totalCheckins.toLocaleString()}
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										Across all events
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
									<Scan className="h-6 w-6 text-green-500" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-muted-foreground text-sm">
										Total Locations
									</p>
									<p className="mt-2 font-bold text-2xl">
										{stats.totalLocations}
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										Avg{" "}
										{stats.totalEvents > 0
											? (stats.totalLocations / stats.totalEvents).toFixed(1)
											: 0}{" "}
										per event
									</p>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
									<Activity className="h-6 w-6 text-orange-500" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Events Grid */}
			<div>
				<h2 className="mb-4 font-semibold text-xl">Your Events</h2>
				{events && events.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{events.map((event) => (
							<EventOverviewCard
								key={event.id}
								event={event}
								onViewDetails={onEventSelect}
							/>
						))}
					</div>
				) : (
					<Card>
						<CardContent className="p-12 text-center">
							<Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">No events yet</h3>
							<p className="mb-4 text-muted-foreground">
								Create your first event to get started.
							</p>
							<Button>Create Event</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
