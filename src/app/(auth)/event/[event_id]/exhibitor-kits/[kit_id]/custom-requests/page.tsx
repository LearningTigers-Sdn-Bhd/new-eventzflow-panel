"use client";

import { use } from "react";
import { CustomRequestsPage } from "@/components/pages/exhibitor-kits/custom-requests-page";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

export default function Page({ params }: { params: Promise<{ event_id: string; kit_id: string }> }) {
	const { event_id, kit_id } = use(params);
	const eventId = Number(event_id);
	const { eventVendorId } = useCurrentUserEventVendorId(eventId);
	return eventVendorId ? <CustomRequestsPage eventId={eventId} eventVendorId={eventVendorId} kitId={Number(kit_id)} /> : null;
}
