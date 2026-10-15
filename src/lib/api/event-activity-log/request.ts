export interface GetEventActivityLogRequest {
	eventId: string;
	category?: string;
	result?: "success" | "failed";
	userId?: string;
	q?: string;
	from_date?: string;
	to_date?: string;
	page?: number;
	per_page?: number;
}
