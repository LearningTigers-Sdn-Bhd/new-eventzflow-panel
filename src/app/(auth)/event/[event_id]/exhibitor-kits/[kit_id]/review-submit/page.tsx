"use client";

import { use } from "react";
import { ReviewSubmitPage } from "@/components/pages/exhibitor-kits";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

export default function Page({ params }: { params: Promise<{ event_id: string; kit_id: string }> }) {
	const { event_id, kit_id } = use(params);
	const eventId = Number(event_id);
	const kitId = Number(kit_id);
	const { eventVendor } = useCurrentUserEventVendorId(eventId);
	return eventVendor?.exhibitor_kits.some((kit) => kit.id === kitId) ? <ReviewSubmitPage eventId={eventId} eventVendorId={eventVendor.id} kitId={kitId} /> : null;
}
