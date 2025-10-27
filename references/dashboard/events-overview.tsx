"use client";

import { LoadingState, ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { EventOverviewCard } from "./event-overview-card";
import { Activity, Calendar, DollarSign, Scan, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EventsOverviewProps {
	onEventSelect: (eventId: string) => void;
}

export function EventsOverview({ onEventSelect }: EventsOverviewProps) {
	const {
		data: events,
		isLoading: eventsLoading,
		error: eventsError,
	} = useQuery(trpc.dashboard.getEventsOverview.queryOptions());

	const {
		data: stats,
		isLoading: statsLoading,
	} = useQuery(trpc.dashboard.getAllEventsStats.queryOptions());

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
				action={
					<Button onClick={() => window.location.reload()}>Retry</Button>
				}
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
									<p className="text-muted-foreground text-sm font-medium">
										Total Events
									</p>
									<p className="font-bold text-2xl mt-2">{stats.totalEvents}</p>
									<p className="text-muted-foreground text-xs mt-1">
										{stats.activeEvents} active
									</p>
								</div>
								<div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
									<Calendar className="h-6 w-6 text-blue-500" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-muted-foreground text-sm font-medium">
										Total Tickets
									</p>
									<p className="font-bold text-2xl mt-2">
										{stats.totalTickets.toLocaleString()}
									</p>
									<p className="text-muted-foreground text-xs mt-1">
										{stats.totalTickets.toLocaleString()} tickets
									</p>
								</div>
								<div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
									<Ticket className="h-6 w-6 text-purple-500" />
								</div>
							</div>
						</CardContent>
					</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm font-medium">
									Total Check-Ins
								</p>
								<p className="font-bold text-2xl mt-2">
									{stats.totalCheckins.toLocaleString()}
								</p>
								<p className="text-muted-foreground text-xs mt-1">
									Across all events
								</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
								<Scan className="h-6 w-6 text-green-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm font-medium">
									Total Locations
								</p>
								<p className="font-bold text-2xl mt-2">
									{stats.totalLocations}
								</p>
								<p className="text-muted-foreground text-xs mt-1">
									Avg {stats.totalEvents > 0 
										? (stats.totalLocations / stats.totalEvents).toFixed(1)
										: 0} per event
								</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
								<Activity className="h-6 w-6 text-orange-500" />
							</div>
						</div>
					</CardContent>
				</Card>
				</div>
			)}

			{/* Events Grid */}
			<div>
				<h2 className="font-semibold text-xl mb-4">Your Events</h2>
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
							<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="font-semibold text-lg mb-2">No events yet</h3>
							<p className="text-muted-foreground mb-4">
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
