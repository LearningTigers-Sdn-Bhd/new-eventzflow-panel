"use client";

import { useQueries } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { AnalyticsClientWrapper } from "@/components/pages/event/details-page/analytics-client-wrapper";
import { EventDetailsActionButtons } from "@/components/pages/event/details-page/event-details-action-buttons";
import { EventDetailsView } from "@/components/pages/event/details-page/event-details-view";
import EventSettingsDialog from "@/components/pages/event/settings/edit-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
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
	const { isVendor, isExhibitionContractor, canManageEvent } =
		useEventPermissions(event_id);
	const { openDialog, closeDialog } = useDialog();

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
				queryFn: async () => {
					const eventDetails = await getEventById(event_id);
					if (eventDetails.use_voucher !== true) {
						return null;
					}
					return getVoucherAnalytics({
						event_id: Number.parseInt(event_id, 10),
					});
				},
				enabled: shouldFetchAnalytics,
			},
		],
	});

	const [
		{ data: event, isLoading: eventLoading, error: eventError },
		{ data: analytics },
		{ data: mallData },
		{ data: voucherAnalytics },
	] = queries;

	// Set header actions
	const openEventSettings = () => {
		if (!event) return;
		openDialog({
			component: EventSettingsDialog,
			config: {
				title: "Event Settings",
				size: "full",
			},
			props: {
				eventId: event.id,
				onClose: closeDialog,
			},
		});
	};

	useSetEventActions(
		event && canManageEvent ? (
			<Button
				variant="outline"
				size="sm"
				className="rounded-none"
				onClick={openEventSettings}
			>
				<Pencil className="mr-2 h-4 w-4" />
				Edit Event
			</Button>
		) : null,
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

	return (
		<div className="space-y-6">
			<EventDetailsActionButtons event={event} />

			{shouldFetchAnalytics && (
				<AnalyticsClientWrapper
					event={event}
					ticketAnalytics={analytics as EventAnalyticsType | undefined}
					mallData={mallData}
					voucherAnalytics={voucherAnalytics ?? undefined}
				/>
			)}

			<EventDetailsView event={event} />
		</div>
	);
}
