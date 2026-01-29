"use client";

import { useQuery } from "@tanstack/react-query";
import { List } from "lucide-react";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventsOverview } from "@/lib/api/dashboard";
import { AllEventsOverview } from "./all-events-overview";
import { EventsOverviewSkeleton } from "./events-overview-skeleton";

export function DashboardClientWrapper() {
	const { isInitialized } = useAuth();

	const {
		data: events,
		isLoading: eventsLoading,
		error: eventsError,
	} = useQuery({
		queryKey: ["events-overview"],
		queryFn: getEventsOverview,
		enabled: isInitialized,
	});

	if (eventsLoading) {
		return <EventsOverviewSkeleton />;
	}

	if (eventsError) {
		return (
			<ErrorState
				title="Failed to load events"
				description="We couldn't load your events data. Please try again."
				action={
					<Button onClick={() => window.location.reload()}>Retry</Button>
				}
			/>
		);
	}

	return (
		<div className="flex flex-col pb-12">
			<div className="border-t border-dashed">
				<div className="page-header">
					<div className="w-full px-0 lg:px-4">
						<IconTitle
							icon={List}
							title="All Events Overview"
							description="Quick view of all your events and their performance"
						/>
					</div>
				</div>
				<AllEventsOverview
					events={events}
					isLoading={eventsLoading}
					error={eventsError}
				/>
			</div>
		</div>
	);
}
