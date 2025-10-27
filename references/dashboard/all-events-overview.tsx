"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronRight, Clock, MapPin, Scan, Ticket, TrendingUp } from "lucide-react";
import { LoadingState, ErrorState } from "@/components/data-state";

interface AllEventsOverviewProps {
	onEventSelect: (eventId: string) => void;
}

export function AllEventsOverview({ onEventSelect }: AllEventsOverviewProps) {
	const { formatDate } = useFormatDate();
	const {
		data: events,
		isLoading,
		error,
	} = useQuery(trpc.dashboard.getEventsOverview.queryOptions());

	if (isLoading) {
		return (
			<LoadingState
				title="Loading events..."
				description="Please wait while we fetch all events data."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load events"
				description="We couldn't load events data. Please try again."
				action={
					<Button onClick={() => window.location.reload()}>Retry</Button>
				}
			/>
		);
	}

	if (!events || events.length === 0) {
		return (
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
		);
	}

	return (
		<div className="space-y-4">
			{/* Helper Info */}
			{events.length > 1 && (
				<div className="flex items-center gap-2 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
					<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
						<Calendar className="h-3.5 w-3.5 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium">
							You have {events.length} events
						</p>
						<p className="text-xs text-muted-foreground">
							Click "View Details" on any event to see detailed analytics
						</p>
					</div>
				</div>
			)}
			
			<div className="grid gap-4 md:grid-cols-2">
				{events.map((event) => {
					const scanRate = event.totalTickets > 0
						? Math.round((event.scannedTickets / event.totalTickets) * 100)
						: 0;

					return (
						<Card key={event.id} className="hover:shadow-lg transition-all hover:border-primary/30 group">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1.5">
											<CardTitle className="text-lg truncate">{event.title}</CardTitle>
											<Badge
												variant={event.status === "active" ? "default" : "destructive"}
												className="flex-shrink-0"
											>
												{event.status === "active" ? "Active" : "Inactive"}
											</Badge>
										</div>
										{event.lastActivity && (
											<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
												<Clock className="h-3 w-3 flex-shrink-0" />
												<span className="truncate">Last activity: {formatDate(event.lastActivity)}</span>
											</div>
										)}
									</div>
									<Button
										variant="default"
										size="sm"
										onClick={() => onEventSelect(event.id)}
										className="gap-1 group-hover:shadow-md transition-shadow flex-shrink-0"
									>
										Details
										<ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Stats Grid */}
								<div className="grid grid-cols-3 gap-3">
									{/* Total Tickets */}
									<div className="space-y-1 border border-primary/20 rounded-md p-2 bg-primary/5">
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Ticket className="h-3 w-3" />
											<span>Total</span>
										</div>
										<p className="font-bold text-lg">{event.totalTickets}</p>
									</div>

									{/* Scanned */}
									<div className="space-y-1 border border-primary/20 rounded-md p-2 bg-primary/5">
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Scan className="h-3 w-3" />
											<span>Scanned</span>
										</div>
										<p className="font-bold text-lg text-green-600 dark:text-green-400">
											{event.scannedTickets}
										</p>
									</div>

									{/* Pending */}
									<div className="space-y-1 border border-primary/20 rounded-md p-2 bg-primary/5">
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Clock className="h-3 w-3" />
											<span>Pending</span>
										</div>
										<p className="font-bold text-lg text-orange-600 dark:text-orange-400">
											{event.pendingTickets}
										</p>
									</div>
								</div>

								{/* Revenue & Progress */}
								<div className="flex items-center gap-4 pt-2 border-t">
									<div className="space-y-1">
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<TrendingUp className="h-3 w-3" />
											<span>Revenue</span>
										</div>
										<p className="font-bold text-lg">${event.totalRevenue.toLocaleString()}</p>
									</div>

									<div className="flex-1 space-y-1">
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Progress</span>
											<span className="font-medium">{scanRate}%</span>
										</div>
										<div className="h-2 bg-secondary rounded-full overflow-hidden">
											<div
												className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
												style={{ width: `${scanRate}%` }}
											/>
										</div>
										<p className="text-xs text-muted-foreground text-right">
											{event.scannedTickets} / {event.totalTickets}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
