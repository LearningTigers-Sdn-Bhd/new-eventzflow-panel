import { restClient } from "@/utils/rest-api";
import type { GetEventActivityLogRequest } from "./request";
import type { EventActivityLogResponse } from "./response";

export function getEventActivityLog({
	eventId,
	category,
	result,
	userId,
	q,
	from_date,
	to_date,
	page = 1,
	per_page = 25,
}: GetEventActivityLogRequest): Promise<EventActivityLogResponse> {
	const query = new URLSearchParams({
		page: String(page),
		per_page: String(per_page),
	});
	if (category) query.set("category", category);
	if (result) query.set("result", result);
	if (userId) query.set("user_id", userId);
	if (q) query.set("q", q);
	if (from_date) query.set("from_date", from_date);
	if (to_date) query.set("to_date", to_date);
	return restClient.get<EventActivityLogResponse>(
		`v1/events/${encodeURIComponent(eventId)}/activity_logs?${query}`,
	);
}

export function clearEventActivityLog({
	eventId,
}: {
	eventId: string;
}): Promise<{ success: boolean }> {
	return restClient.delete<{ success: boolean }>(
		`v1/events/${encodeURIComponent(eventId)}/activity_logs/clear`,
	);
}
