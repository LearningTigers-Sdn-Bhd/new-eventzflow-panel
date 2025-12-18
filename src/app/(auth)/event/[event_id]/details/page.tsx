"use client";

import { useQueries } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { EventDetailsPageContent } from "@/components/pages/event/details-page/client-wrapper";
import { EventDetailsActionButtons } from "@/components/pages/event/details-page/event-details-action-buttons";
import { Button } from "@/components/ui/button";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventAnalytics } from "@/lib/api/dashboard";
import type { EventAnalytics as EventAnalyticsType } from "@/lib/api/dashboard/response";
import { getEventById } from "@/lib/api/event";
import { getMallLiveFeed } from "@/lib/api/event/analytics";
import { getVoucherAnalytics } from "@/lib/api/voucher-analytics";

export default function EventDetailsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const isHydrated = useHydratedStore();

	const queries = useQueries({
		queries: [
			{
				queryKey: ["event", event_id],
				queryFn: () => getEventById(event_id),
				enabled: isHydrated,
			},
			{
				queryKey: ["event-analytics", event_id],
				queryFn: () => getEventAnalytics(event_id),
				enabled: isHydrated,
			},
			{
				queryKey: ["event", event_id, "mall-live-feed"],
				queryFn: () => getMallLiveFeed({ id: Number.parseInt(event_id, 10) }),
				enabled: isHydrated,
			},
			{
				queryKey: ["voucher-analytics", event_id],
				queryFn: () =>
					getVoucherAnalytics({
						event_id: Number.parseInt(event_id, 10),
					}),
				enabled: isHydrated,
			},
		],
	});

	const [
		{ data: event, isLoading: eventLoading, error: eventError },
		{ data: analytics, isLoading: analyticsLoading, error: analyticsError },
		{ data: mallData, isLoading: mallLoading, error: mallError },
		{ data: voucherAnalytics, isLoading: voucherLoading },
	] = queries;

	useSetEventActions(
		event ? <EventDetailsActionButtons event={event} /> : null,
	);

	if (eventLoading) {
		return (
			<LoadingState
				title="Loading event details..."
				description="Please wait while we fetch event information."
			/>
		);
	}

	if (eventError || !event) {
		return (
			<ErrorState
				title="Failed to load event details"
				description="We couldn't load event details. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const isTicketEvent = event.use_ticket !== false;
	const isLoading = isTicketEvent
		? analyticsLoading
		: mallLoading || voucherLoading;
	const error = isTicketEvent ? analyticsError : mallError;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading analytics..."
				description="Please wait while we fetch event analytics."
			/>
		);
	}

	if (error || (isTicketEvent && !analytics)) {
		return (
			<ErrorState
				title="Failed to load analytics"
				description="We couldn't load event analytics. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<EventDetailsPageContent
			event={event}
			ticketAnalytics={analytics as EventAnalyticsType | undefined}
			mallData={mallData}
			voucherAnalytics={voucherAnalytics}
		/>
	);
}
