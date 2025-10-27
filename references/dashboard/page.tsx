"use client";

import { useState } from "react";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Scan, Ticket, Activity } from "lucide-react";
import { EventSwitcher } from "./event-switcher";
import { EventAnalytics } from "./event-analytics";
import { AllEventsOverview } from "./all-events-overview";
import { StatsSkeleton } from "./stats-skeleton";
import { EventsOverviewSkeleton } from "./events-overview-skeleton";

export default function DashboardPage() {
	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

	const {
		data: stats,
		isLoading: statsLoading,
		error: statsError,
	} = useQuery(trpc.dashboard.getAllEventsStats.queryOptions());

	const {
		data: events,
		isLoading: eventsLoading,
		error: eventsError,
	} = useQuery(trpc.dashboard.getEventsOverview.queryOptions());

	return (
		<div className="p-2 space-y-6">
			{/* Header */}
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Monitor your events and track performance
				</p>
			</div>

		{/* Overall Stats - Show skeleton while loading or error state */}
		{statsLoading ? (
			<StatsSkeleton />
		) : statsError ? (
			<ErrorState
				title="Failed to load statistics"
				description="We couldn't load your dashboard statistics. Please try again."
				action={
					<Button onClick={() => window.location.reload()}>Retry</Button>
				}
			/>
		) : stats ? (
			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex-1 min-w-0">
								<p className="text-muted-foreground text-base font-medium">
									Total Events
								</p>
								<p className="font-bold text-xl mt-1">{stats.totalEvents}</p>
								<p className="text-muted-foreground text-xs mt-0.5">
									{stats.activeEvents} active
								</p>
							</div>
							<div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
								<Calendar className="h-5 w-5 text-blue-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex-1 min-w-0">
								<p className="text-muted-foreground text-base font-medium">
									Total Tickets
								</p>
								<p className="font-bold text-xl mt-1">
									{stats.totalTickets.toLocaleString()}
								</p>
								<p className="text-muted-foreground text-xs mt-0.5">
									Across all events
								</p>
							</div>
							<div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
								<Ticket className="h-5 w-5 text-purple-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex-1 min-w-0">
								<p className="text-muted-foreground text-base font-medium">
									Total Check-Ins
								</p>
								<p className="font-bold text-xl mt-1">
									{stats.totalCheckins.toLocaleString()}
								</p>
								<p className="text-muted-foreground text-xs mt-0.5">
									Across all events
								</p>
							</div>
							<div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
								<Scan className="h-5 w-5 text-green-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex-1 min-w-0">
								<p className="text-muted-foreground text-base font-medium">
									Total Locations
								</p>
								<p className="font-bold text-xl mt-1">
									{stats.totalLocations}
								</p>
								<p className="text-muted-foreground text-xs mt-0.5">
									Avg {stats.totalEvents > 0 
										? (stats.totalLocations / stats.totalEvents).toFixed(1)
										: 0} per event
								</p>
							</div>
							<div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
								<Activity className="h-5 w-5 text-orange-500" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		) : null}

		{/* All Events Overview Section */}
		{!selectedEventId && (
			<>
				<div className="space-y-4">
					<Separator />
					<div className="flex items-center justify-between gap-4">
						<div className="flex-1">
							<h2 className="font-semibold text-xl">All Events Overview</h2>
							<p className="text-muted-foreground text-sm mt-1">
								Quick view of all your events and their performance
							</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-right hidden sm:block">
								<p className="text-sm font-medium">Switch Event</p>
								<p className="text-xs text-muted-foreground">
									Select to view details
								</p>
							</div>
							<EventSwitcher
								currentEventId={selectedEventId}
								onEventChange={setSelectedEventId}
							/>
						</div>
					</div>
				</div>
				{eventsLoading ? (
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
					<AllEventsOverview onEventSelect={setSelectedEventId} />
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
							<p className="text-muted-foreground text-sm mt-1">
								Detailed insights and metrics for this event
							</p>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-right hidden sm:block">
								<p className="text-sm font-medium">Switch Event</p>
								<p className="text-xs text-muted-foreground">
									View different event
								</p>
							</div>
							<EventSwitcher
								currentEventId={selectedEventId}
								onEventChange={setSelectedEventId}
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
		</div>
	);
}
