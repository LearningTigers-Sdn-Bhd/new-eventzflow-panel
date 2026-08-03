"use client";

import { use } from "react";
import { MyItemsPage } from "@/components/pages/exhibitor-kits";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

export default function Page({ params }: { params: Promise<{ event_id: string; kit_id: string }> }) {
	const { event_id, kit_id } = use(params);
	const eventId = Number(event_id);
	const kitId = Number(kit_id);
	const { eventVendorId } = useCurrentUserEventVendorId(eventId);
	return eventVendorId ? <MyItemsPage eventId={eventId} eventVendorId={eventVendorId} kitId={kitId} /> : null;
}
