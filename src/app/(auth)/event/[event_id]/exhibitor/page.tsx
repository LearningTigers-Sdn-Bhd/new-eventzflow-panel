"use client";

import { use } from "react";
import { ExhibitorPageButton } from "@/components/pages/event-exhibitor/page-action/button";
import { ExhibitorListView } from "@/components/pages/event-exhibitor/exhibitor-list-view";
import { VendorProfileView } from "@/components/pages/event-vendors/vendor-profile-view";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useSetEventActions } from "@/hooks/use-set-event-actions";

export default function ExhibitorPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	// Check permissions
	const { canManageEventVendors, isEventVendor } = useEventPermissions(event_id);

	useSetEventActions(canManageEventVendors ? <ExhibitorPageButton /> : null);

	// If user is a vendor (not admin), show their profile
	if (isEventVendor && !canManageEventVendors) {
		return <VendorProfileView />;
	}

	return <ExhibitorListView eventId={event_id} canManageVendors={canManageEventVendors} />;
}
