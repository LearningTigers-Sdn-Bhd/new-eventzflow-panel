"use client";

import { use } from "react";
import { EventVendorsPageButton } from "@/components/pages/event-vendors/page-action/button";
import { VendorProfileView } from "@/components/pages/event-vendors/vendor-profile-view";
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
	const { canManageEventVendors, isEventVendor } = useEventPermissions(event_id);

	useSetEventActions(canManageEventVendors ? <EventVendorsPageButton /> : null);

	// If user is a vendor (not admin), show their profile
	if (isEventVendor && !canManageEventVendors) {
		return <VendorProfileView />;
	}

	return (
		<VendorsListView 
			eventId={event_id} 
			canManageVendors={canManageEventVendors}
		/>
	);
}
