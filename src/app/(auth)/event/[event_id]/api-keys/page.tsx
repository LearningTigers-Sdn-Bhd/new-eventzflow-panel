"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import EventApiKeysClientWrapper from "@/components/pages/api/event-api-keys-client-wrapper";
import { ApiKeysSkeleton } from "@/components/pages/api/skeleton/api-keys-skeleton";
import { Button } from "@/components/ui/button";
import { getEventApiKeys } from "@/lib/api/api-keys";
import { getEventById } from "@/lib/api/event";

export default function EventApiKeysPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const eventId = Number(event_id);

	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});

	const {
		data: apiKeys,
		isLoading: isLoadingKeys,
		error,
	} = useQuery({
		queryKey: ["event", event_id, "api-keys"],
		queryFn: () => getEventApiKeys(eventId),
		enabled: event?.use_api_access === true,
	});

	if (!isLoadingEvent && event?.use_api_access !== true) {
		return <FeatureLockedState featureName="API Access" />;
	}

	if (isLoadingEvent || isLoadingKeys) {
		return <ApiKeysSkeleton />;
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load API keys"
				description="We couldn't load the API keys. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="space-y-6 p-0">
			<EventApiKeysClientWrapper
				eventId={eventId}
				event={event!}
				apiKeys={apiKeys || []}
			/>
		</div>
	);
}
