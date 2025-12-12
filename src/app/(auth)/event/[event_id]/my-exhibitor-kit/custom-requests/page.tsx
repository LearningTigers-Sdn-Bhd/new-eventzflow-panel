"use client";

import { use } from "react";
import { CustomRequestsPage } from "@/components/pages/exhibitor-kits/custom-requests-page";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

interface PageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function CustomRequestsRoute({ params }: PageProps) {
	const { event_id } = use(params);
	const eventId = Number(event_id);
	const { eventVendorId, isLoading } = useCurrentUserEventVendorId(eventId);

	if (isLoading) {
		return (
			<div className="space-y-6 px-2 py-6 md:px-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!eventVendorId) {
		return (
			<div className="px-2 py-6 text-center md:px-4">
				<p className="text-muted-foreground">
					You are not registered as a vendor for this event.
				</p>
			</div>
		);
	}

	return <CustomRequestsPage eventId={eventId} eventVendorId={eventVendorId} />;
}
