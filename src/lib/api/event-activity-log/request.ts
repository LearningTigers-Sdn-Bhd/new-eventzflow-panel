export interface GetEventActivityLogRequest {
	eventId: string;
	category?: string;
	result?: "success" | "failed";
	userId?: string;
	q?: string;
	page?: number;
	per_page?: number;
}
