"use client";

import { use } from "react";
import { VendorProfileView } from "@/components/pages/event-vendors/vendor-profile-view";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";

export default function MyProfilePage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	// Check permissions - only vendors can access this page
	const { isEventVendor, canManageEventVendors } =
		useEventPermissions(event_id);

	// If user is not a vendor or is an admin, show error
	if (!isEventVendor || canManageEventVendors) {
		return (
			<ErrorState
				title="Access Denied"
				description="This page is only accessible to vendor users."
				action={
					<Button onClick={() => window.history.back()}>Go Back</Button>
				}
			/>
		);
	}

	return <VendorProfileView eventId={event_id} />;
}
