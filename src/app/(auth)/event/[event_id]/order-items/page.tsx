"use client";

import { use } from "react";
import { redirect } from "next/navigation";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

interface OrderItemsRouteProps {
	params: Promise<{ event_id: string }>;
}

export default function OrderItemsRoute({ params }: OrderItemsRouteProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);
	const { eventVendor } = useCurrentUserEventVendorId(eventId);
	if (!eventVendor) return null;
	redirect(
		eventVendor.exhibitor_kits.length === 1
			? `/event/${eventId}/exhibitor-kits/${eventVendor.exhibitor_kits[0].id}/order-items`
			: `/event/${eventId}/exhibitor-kits`,
	);
}
