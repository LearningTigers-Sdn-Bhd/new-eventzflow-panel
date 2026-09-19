"use client";

import { ActivityLogTable } from "./activity-log-table";

export function EventActivityView({ eventId }: { eventId: string }) {
	return <ActivityLogTable eventId={eventId} />;
}
