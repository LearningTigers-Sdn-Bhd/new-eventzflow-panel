"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { RegistrationFormPageButton } from "@/components/pages/registration-forms/page-action/button";
import { RegistrationFormTable } from "@/components/pages/registration-forms/registration-form-table";
import { useEventSidebarContextSafe } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventRegistrationForms } from "@/lib/api/registration-form";

export default function RegistrationFormsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const eventSidebarContext = useEventSidebarContextSafe();
	const eventSlug = eventSidebarContext?.currentEvent?.slug;

	useSetEventActions(
		<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
			<RegistrationFormPageButton eventId={event_id} eventSlug={eventSlug} />
		</div>,
	);

	const {
		data: registrationForms,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", event_id, "registration-forms"],
		queryFn: () => getEventRegistrationForms({ eventId: event_id }),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading registration forms..."
					description="Please wait while we fetch your registration forms..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load registration forms"
					description={
						error?.message ||
						"We couldn't load registration forms. Please try again."
					}
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : (
				<RegistrationFormTable data={registrationForms || []} />
			)}
		</div>
	);
}
