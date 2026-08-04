"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
	Briefcase,
	CalendarCheck,
	ChevronRight,
	Clock,
	MapPin,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { CompactStatsCard } from "@/components/admin-ui/analytic";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/use-auth";
import { getBusinessMatchingEvents } from "@/lib/api/business-matching";
import { getEventsOverview } from "@/lib/api/dashboard";

export function BusinessHostDashboard() {
	const { isInitialized } = useAuth();
	const router = useRouter();

	// Already scoped server-side to events this host is assigned to.
	const {
		data: events,
		isLoading: eventsLoading,
		error: eventsError,
	} = useQuery({
		queryKey: ["events-overview"],
		queryFn: getEventsOverview,
		enabled: isInitialized,
	});

	// The events endpoint doesn't carry business-matching session data, so
	// fetch each event's sessions (already filtered to this host's own by
	// the backend) in parallel.
	const sessionQueries = useQueries({
		queries: (events || []).map((event) => ({
			queryKey: ["business-matching-events", event.id],
			queryFn: () => getBusinessMatchingEvents(event.id),
			enabled: isInitialized,
		})),
	});

	const isLoading = eventsLoading || sessionQueries.some((q) => q.isLoading);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading your sessions..."
				description="Please wait while we fetch your business matching data."
			/>
		);
	}

	if (eventsError) {
		return (
			<ErrorState
				title="Failed to load your events"
				description="We couldn't load your business matching data. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const eventsWithSessions = (events || []).map((event, i) => ({
		event,
		sessions: sessionQueries[i]?.data || [],
	}));
	const hasAnySessions = eventsWithSessions.some(
		({ sessions }) => sessions.length > 0,
	);

	return (
		<div className="space-y-0 pb-12">
			<div className="page-header border-b border-dashed">
				<div className="w-full px-0 lg:px-4">
					<IconTitle
						icon={Briefcase}
						title="Business Matching"
						description="Your assigned matchmaking sessions and bookings"
					/>
				</div>
			</div>

			<div className="p-3 sm:p-4">
				{!hasAnySessions ? (
					<Card className="rounded-none border-dashed">
						<CardContent className="p-8 text-center sm:p-12">
							<Briefcase className="mx-auto mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
							<h3 className="mb-2 font-semibold text-base sm:text-lg">
								No matchmaking sessions yet
							</h3>
							<p className="text-muted-foreground text-sm">
								You haven't been assigned to any business matching sessions.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 lg:grid-cols-2">
						{eventsWithSessions.flatMap(({ event, sessions }) =>
							sessions.map((session) => (
								<Card
									key={session.id}
									className="group rounded-none border-dashed p-0 transition-all hover:border-primary/30 hover:border-solid hover:shadow-md"
								>
									<CardHeader className="space-y-2 px-4 pt-4">
										<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
											<div className="min-w-0">
												<CardTitle className="line-clamp-2 text-balance text-base tracking-tight">
													{session.title}
												</CardTitle>
												<span className="text-muted-foreground text-xs">
													{event.title}
												</span>
												<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
													{session.location && (
														<span className="flex items-center gap-1">
															<MapPin className="h-3 w-3 shrink-0" />
															{session.location}
														</span>
													)}
													<span className="flex items-center gap-1">
														<Clock className="h-3 w-3 shrink-0" />
														{session.duration} min sessions
													</span>
												</div>
											</div>
											<Button
												variant="default"
												size="sm"
												onClick={() =>
													router.push(
														`/event/${event.id}/business-matching` as Route,
													)
												}
												className="w-full shrink-0 gap-1 rounded-none py-6 transition-shadow group-hover:shadow-md sm:w-auto md:py-0"
											>
												View
												<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
											</Button>
										</div>
									</CardHeader>
									<CardContent className="px-3 pb-3">
										<CompactStatsCard
											icon={CalendarCheck}
											label="Bookings"
											count={session.bookings_count ?? 0}
											variant="emerald"
										/>
									</CardContent>
								</Card>
							)),
						)}
					</div>
				)}
			</div>
		</div>
	);
}
