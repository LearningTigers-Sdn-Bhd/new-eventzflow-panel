"use client";

import { use } from "react";
import { OrderItemsPage } from "@/components/pages/exhibitor-kits";

interface OrderItemsRouteProps {
	params: Promise<{ event_id: string }>;
}

export default function OrderItemsRoute({ params }: OrderItemsRouteProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);

	return <OrderItemsPage eventId={eventId} />;
}
