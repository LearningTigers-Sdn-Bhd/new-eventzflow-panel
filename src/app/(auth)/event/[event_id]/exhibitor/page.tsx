"use client";

import { use } from "react";
import { ExhibitorListView } from "@/components/pages/event-exhibitor/exhibitor-list-view";
import { ExhibitorPageButton } from "@/components/pages/event-exhibitor/page-action/button";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useSetEventActions } from "@/hooks/use-set-event-actions";

export default function ExhibitorPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	// Check permissions
	const { canManageEventVendors } = useEventPermissions(event_id);

	useSetEventActions(canManageEventVendors ? <ExhibitorPageButton /> : null);

	return (
		<ExhibitorListView
			eventId={event_id}
			canManageVendors={canManageEventVendors}
		/>
	);
}
