"use client";

import { use } from "react";
import { EventActivityView } from "@/components/pages/event-activity/event-activity-view";

export default function EventActivityPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	return <EventActivityView eventId={event_id} />;
}
