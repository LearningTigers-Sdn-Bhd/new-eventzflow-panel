"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { LoadingState } from "@/components/data-state";
import { EmailBlastView } from "@/components/pages/event-email-blast/email-blast-view";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";

export default function EmailBlastPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const router = useRouter();
	const { permissions, isLoading } = useEventSidebarContext();

	useEffect(() => {
		if (isLoading) return;
		if (!permissions.isOrgOwner) router.replace(`/event/${event_id}` as Route);
	}, [isLoading, permissions.isOrgOwner, event_id, router]);

	if (isLoading || !permissions.isOrgOwner) {
		return <LoadingState title="Loading..." description="" />;
	}

	return <EmailBlastView eventId={event_id} />;
}
