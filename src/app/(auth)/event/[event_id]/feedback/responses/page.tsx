"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { FeedbackResponsesViewer } from "@/components/pages/feedback-form/feedback-responses-viewer";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";
import { getFeedbackForm } from "@/lib/api/feedback-form";

export default function FeedbackResponsesPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { permissions } = useEventSidebarContext();
	const { canManageEventVendors, isEventVendor } = permissions;
	const {
		data: form,
		isLoading,
		isError,
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

	if (isLoading) {
		return (
			<LoadingState
				title="Loading feedback responses..."
				description="Please wait while we load attendee feedback."
			/>
		);
	}

	if (isError) {
		return <ErrorState title="Unable to load feedback responses" />;
	}

	if (!form) {
		return (
			<div className="space-y-6">
				<section className="space-y-3 border border-dashed p-8 text-center">
					<h2 className="font-medium">No feedback form yet</h2>
					<p className="text-muted-foreground text-sm">
						Create a form before responses can be collected.
					</p>
					<Button asChild className="rounded-none">
						<Link href={`/event/${event_id}/feedback/form-builder` as Route}>
							Open Form Builder
						</Link>
					</Button>
				</section>
			</div>
		);
	}

	return <FeedbackResponsesViewer eventId={event_id} form={form} />;
}
