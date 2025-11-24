"use client";

import { AssignVendorForm } from "@/components/pages/location/assign-vendor-form";
import { use } from "react";

export default function AssignVendorPage({
	params,
}: {
	params: Promise<{ event_id: string; location_id: string }>;
}) {
	const { event_id, location_id } = use(params);

	return (
		<div className="container py-10">
			<AssignVendorForm eventId={event_id} locationId={location_id} />
		</div>
	);
}
