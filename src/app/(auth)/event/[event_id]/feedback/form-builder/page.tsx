"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { FeedbackAudienceTabs } from "@/components/pages/feedback-form/audience-tabs";
import { FeedbackFormBuilder } from "@/components/pages/feedback-form/feedback-form-builder";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { getEventById } from "@/lib/api/event";
import {
	type FeedbackAudience,
	getFeedbackForm,
} from "@/lib/api/feedback-form";

export default function FeedbackFormBuilderPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { permissions } = useEventSidebarContext();
	const { canManageEventVendors, isEventVendor } = permissions;
	const [audience, setAudience] = useState<FeedbackAudience>("ticket");

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
		queryKey: ["event", event_id, "feedback-form", audience],
		queryFn: () => getFeedbackForm(event_id, audience),
		enabled: canManageEventVendors && event?.use_feedback === true,
		// A focus refetch bumps dataUpdatedAt, which remounts the builder and drops unsaved edits.
		refetchOnWindowFocus: false,
	});

	if (eventLoading) {
		return (
			<LoadingState
				title="Loading feedback form..."
				description="Please wait while we load the form builder."
			/>
		);
	}

	if (event?.use_feedback !== true || !canManageEventVendors) {
		return (
			<FeatureLockedState
				isEventVendor={isEventVendor}
				featureName="Feedback Form"
			/>
		);
	}

	if (isError || !event) {
		return <ErrorState title="Unable to load the feedback form" />;
	}

	// Keep the tabs on screen while the other audience's form loads.
	if (formLoading) {
		return (
			<div className="space-y-4">
				<FeedbackAudienceTabs
					value={audience}
					onChange={setAudience}
					enabled={event?.use_exhibitor_kit === true}
				/>
				<LoadingState
					title="Loading feedback form..."
					description="Please wait while we load the form builder."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<FeedbackAudienceTabs
				value={audience}
				onChange={setAudience}
				enabled={event?.use_exhibitor_kit === true}
			/>
			<FeedbackFormBuilder
				// Remount after each save (or audience switch) so drafts pick up server-assigned question ids.
				key={`${audience}-${dataUpdatedAt}`}
				eventId={event_id}
				eventSlug={event.slug}
				audience={audience}
				form={form ?? null}
			/>
		</div>
	);
}
