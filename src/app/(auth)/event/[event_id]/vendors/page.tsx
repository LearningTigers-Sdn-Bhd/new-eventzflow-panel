"use client";

import { use } from "react";
import { EventVendorsPageButton } from "@/components/pages/event-vendors/page-action/button";
import { VendorsListView } from "@/components/pages/event-vendors/vendors-list-view";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useSetEventActions } from "@/hooks/use-set-event-actions";

export default function EventVendorsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	// Check permissions
	const { canManageEventVendors } = useEventPermissions(event_id);

	useSetEventActions(canManageEventVendors ? <EventVendorsPageButton /> : null);

	return (
		<VendorsListView
			eventId={event_id}
			canManageVendors={canManageEventVendors}
		/>
	);
}
