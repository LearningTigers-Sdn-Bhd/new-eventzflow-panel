"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { LoadingState } from "@/components/data-state";
import { EventEmailStatusView } from "@/components/pages/event-email-status/event-email-status-view";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";

export default function EventEmailStatusPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const router = useRouter();
	const { permissions, isLoading } = useEventSidebarContext();
	const canView = permissions.isOrgOwner || permissions.isEventAdmin;

	useEffect(() => {
		if (isLoading) return;
		if (!canView) router.replace(`/event/${event_id}` as Route);
	}, [isLoading, canView, event_id, router]);

	if (isLoading || !canView) {
		return <LoadingState title="Loading..." description="" />;
	}

	return <EventEmailStatusView eventId={event_id} />;
}
