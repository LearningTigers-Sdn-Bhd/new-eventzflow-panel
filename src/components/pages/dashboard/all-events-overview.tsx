"use client";

import {
	Calendar,
	ChevronRight,
	Clock,
	Scan,
	Ticket,
	TrendingUp,
} from "lucide-react";
import type { ReactElement } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";

interface AllEventsOverviewProps {
	onEventSelect: (eventId: string) => void;
	events?: any[];
	isLoading?: boolean;
	error?: any;
}

export function AllEventsOverview({
	onEventSelect,
	events,
	isLoading,
	error,
}: AllEventsOverviewProps): ReactElement {
	const { formatDate } = useFormatDate();

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
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!events || events.length === 0) {
		return (
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
		);
	}

	return (
		<div className="space-y-4">
			{/* Helper Info */}
			{events.length > 1 && (
				<div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
					<div className="p-2 rounded-md border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
						<Calendar className="h-3.5 w-3.5 text-primary" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="font-medium text-sm">
							You have {events.length} events
						</p>
						<p className="text-muted-foreground text-xs">
							Click "View Details" on any event to see detailed analytics
						</p>
					</div>
				</div>
			)}

			<div className="grid gap-4 md:grid-cols-2">
				{events.map((event) => {
					const scanRate =
						event.totalTickets > 0
							? Math.round((event.scannedTickets / event.totalTickets) * 100)
							: 0;

					return (
						<Card
							key={event.id}
							className="group transition-all hover:border-primary/30 hover:shadow-lg"
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1">
										<div className="mb-1.5 flex items-center gap-2">
											<CardTitle className="truncate text-lg">
												{event.title}
											</CardTitle>
											<Badge
												variant={
													event.status === "active" ? "default" : "destructive"
												}
												className="shrink-0"
											>
												{event.status === "active" ? "Active" : "Inactive"}
											</Badge>
										</div>
										{event.lastActivity && (
											<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
												<Clock className="h-3 w-3 shrink-0" />
												<span className="truncate">
													Last activity: {formatDate(event.lastActivity)}
												</span>
											</div>
										)}
									</div>
									<Button
										variant="default"
										size="sm"
										onClick={() => onEventSelect(event.id)}
										className="shrink-0 gap-1 transition-shadow group-hover:shadow-md"
									>
										Details
										<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Stats Grid */}
								<div className="grid grid-cols-3 gap-3">
									{/* Total Tickets */}
									<div className="space-y-1 rounded-md border border-primary/20 bg-primary/5 p-2">
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Ticket className="h-3 w-3" />
											<span>Total</span>
										</div>
										<p className="font-bold text-lg">{event.totalTickets}</p>
									</div>

									{/* Scanned */}
									<div className="space-y-1 rounded-md border border-primary/20 bg-primary/5 p-2">
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<Scan className="h-3 w-3" />
											<span>Scanned</span>
										</div>
										<p className="font-bold text-green-600 text-lg dark:text-green-400">
											{event.scannedTickets}
										</p>
									</div>

									{/* Pending */}
									<div className="space-y-1 rounded-md border border-primary/20 bg-primary/5 p-2">
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
								<div className="flex items-center gap-4 border-t pt-2">
									<div className="space-y-1">
										<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
											<TrendingUp className="h-3 w-3" />
											<span>Revenue</span>
										</div>
										<p className="font-bold text-lg">
											${event.totalRevenue.toLocaleString()}
										</p>
									</div>

									<div className="flex-1 space-y-1">
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Progress</span>
											<span className="font-medium">{scanRate}%</span>
										</div>
										<div className="h-2 overflow-hidden rounded-full bg-secondary">
											<div
												className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
												style={{ width: `${scanRate}%` }}
											/>
										</div>
										<p className="text-right text-muted-foreground text-xs">
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
