"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { FeedbackFormBuilder } from "@/components/pages/feedback-form/feedback-form-builder";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { getEventById } from "@/lib/api/event";
import { getFeedbackForm } from "@/lib/api/feedback-form";

export default function FeedbackPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { permissions } = useEventSidebarContext();
	const { canManageEventVendors, isEventVendor } = permissions;

	const { data: event, isLoading: eventLoading } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});

	const {
		data: form,
		isLoading: formLoading,
		isError,
		dataUpdatedAt,
	} = useQuery({
		queryKey: ["event", event_id, "feedback-form"],
		queryFn: () => getFeedbackForm(event_id),
		enabled: canManageEventVendors,
	});

	if (!canManageEventVendors) {
		return (
			<FeatureLockedState
				isEventVendor={isEventVendor}
				featureName="Feedback Form"
			/>
		);
	}

	if (eventLoading || formLoading) {
		return (
			<LoadingState
				title="Loading feedback form..."
				description="Please wait while we load the form builder."
			/>
		);
	}

	if (isError || !event) {
		return <ErrorState title="Unable to load the feedback form" />;
	}

	return (
		<FeedbackFormBuilder
			// Remount after each save so drafts pick up server-assigned question ids.
			key={dataUpdatedAt}
			eventId={event_id}
			eventSlug={event.slug}
			form={form ?? null}
		/>
	);
}
