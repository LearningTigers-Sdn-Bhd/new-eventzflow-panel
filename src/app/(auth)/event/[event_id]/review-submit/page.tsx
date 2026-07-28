"use client";

import { use } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

interface PageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function Page({ params }: PageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id);

	const { eventVendor, isLoading } = useCurrentUserEventVendorId(eventId);

	if (isLoading) {
		return (
			<div className="space-y-6 px-2 py-6 md:px-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!eventVendor) {
		return (
			<div className="px-2 py-6 text-center md:px-4">
				<p className="text-muted-foreground">
					You are not registered as a vendor for this event.
				</p>
			</div>
		);
	}

	redirect(
		eventVendor.exhibitor_kits.length === 1
			? `/event/${eventId}/exhibitor-kits/${eventVendor.exhibitor_kits[0].id}/review-submit`
			: `/event/${eventId}/exhibitor-kits`,
	);
}
