"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { LoadingState } from "@/components/data-state";
import { EventActivityView } from "@/components/pages/event-activity/event-activity-view";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";

export default function EventActivityPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const router = useRouter();
	const { permissions, isLoading } = useEventSidebarContext();
	const canViewActivityLog =
		permissions.isOrgOwner ||
		permissions.isEventAdmin ||
		permissions.isEventTeamMember;

	useEffect(() => {
		if (isLoading) return;
		if (!canViewActivityLog) {
			router.replace(`/event/${event_id}` as Route);
		}
	}, [isLoading, canViewActivityLog, event_id, router]);

	if (isLoading || !canViewActivityLog) {
		return <LoadingState title="Loading..." description="" />;
	}

	return <EventActivityView eventId={event_id} />;
}
