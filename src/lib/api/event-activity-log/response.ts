export interface ActivityFieldChange {
	from: string;
	to: string;
}

export interface ActivityResource {
	type: string;
	id: string;
	attendee?: {
		name?: string | null;
		email?: string | null;
	};
}

export interface ActivityDetails {
	changes?: Record<string, ActivityFieldChange>;
	resource?: ActivityResource;
	[key: string]: unknown;
}

export interface EventActivityRecord {
	id: number;
	user: {
		id: number;
		email: string;
		full_name: string;
		role: string;
	};
	category: string;
	action_name: string;
	result: "success" | "failed";
	error_message: string | null;
	details: ActivityDetails;
	created_at: string;
	unusual: boolean;
}

export interface EventActivityLogResponse {
	success: boolean;
	audit_logs: {
		records: EventActivityRecord[];
		meta: {
			current_page: number;
			per_page: number;
			total_count: number;
			total_pages: number;
		};
	};
}
