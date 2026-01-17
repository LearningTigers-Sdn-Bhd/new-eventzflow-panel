"use client";

import { useQueries } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { AnalyticsClientWrapper } from "@/components/pages/event/details-page/analytics-client-wrapper";
import { EventDetailsActionButtons } from "@/components/pages/event/details-page/event-details-action-buttons";
import { EventDetailsView } from "@/components/pages/event/details-page/event-details-view";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEventPermissions } from "@/hooks/use-event-permissions";
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
	const { isInitialized } = useAuth();
	const { isVendor, isExhibitionContractor } = useEventPermissions(event_id);

	const shouldFetchAnalytics =
		isInitialized && !isVendor && !isExhibitionContractor;

	const queries = useQueries({
		queries: [
			{
				queryKey: ["event", event_id],
				queryFn: () => getEventById(event_id),
				enabled: isInitialized,
			},
			{
				queryKey: ["event-analytics", event_id],
				queryFn: () => getEventAnalytics(event_id),
				enabled: shouldFetchAnalytics,
			},
			{
				queryKey: ["event", event_id, "mall-live-feed"],
				queryFn: () => getMallLiveFeed({ id: Number.parseInt(event_id, 10) }),
				enabled: shouldFetchAnalytics,
			},
			{
				queryKey: ["voucher-analytics", event_id],
				queryFn: () =>
					getVoucherAnalytics({
						event_id: Number.parseInt(event_id, 10),
					}),
				enabled: shouldFetchAnalytics,
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

	// Only show loading/error for analytics if we are actually fetching them
	const isLoading =
		shouldFetchAnalytics &&
		(isTicketEvent ? analyticsLoading : mallLoading || voucherLoading);
	const error = shouldFetchAnalytics
		? isTicketEvent
			? analyticsError
			: mallError
		: null;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading analytics..."
				description="Please wait while we fetch event analytics."
			/>
		);
	}

	if (error || (shouldFetchAnalytics && isTicketEvent && !analytics)) {
		return (
			<ErrorState
				title="Failed to load analytics"
				description="We couldn't load event analytics. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="space-y-6">
			<EventDetailsView event={event} />

			{shouldFetchAnalytics && (
				<AnalyticsClientWrapper
					event={event}
					ticketAnalytics={analytics as EventAnalyticsType | undefined}
					mallData={mallData}
					voucherAnalytics={voucherAnalytics}
				/>
			)}
		</div>
	);
}
