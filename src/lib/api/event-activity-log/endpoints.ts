import { restClient } from "@/utils/rest-api";
import type { GetEventActivityLogRequest } from "./request";
import type { EventActivityLogResponse } from "./response";

export function getEventActivityLog({
	eventId,
	category,
	result,
	userId,
	q,
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
	return restClient.get<EventActivityLogResponse>(
		`v1/events/${encodeURIComponent(eventId)}/activity_logs?${query}`,
	);
}
