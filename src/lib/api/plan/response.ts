export interface PlanObject {
	id: number;
	plan_id: number;
	object_type: string; // 'table', 'wall', 'door', 'stage', 'label', 'floor'
	layer: string;
	x: number;
	y: number;
	rotation: number;
	width: number;
	height: number;
	path?: string | null;
	label: string | null;
	capacity: number | null;
	locked: boolean;
	z_index: number;
	image_url?: string | null;
	table_assignments?: TableAssignment[];
}

export interface TableAssignment {
	id: number;
	ticket_id: number | null;
	visitor_id: number | null;
	plan_object_id: number;
	notes?: string | null;
	arrived_at?: string | null;
	ticket?: {
		id: number;
		attendee_name: string;
		ticket_type_id: number;
		// Add other fields as needed
	};
	visitor?: {
		id: number;
		full_name: string;
		// Add other fields as needed
	};
}

export interface AutoDistributeSkippedGroup {
	group_id: number;
	name: string;
	size: number;
	max_available_table_seats: number;
	needed_to_fit: number;
}

export interface AutoDistributeResponse {
	assigned_count: number;
	remaining_unassigned: number;
	skipped_groups: AutoDistributeSkippedGroup[];
}

export interface Plan {
	id: number;
	event_id: number;
	name: string;
	created_at: string;
	canvas_width: number;
	canvas_height: number;
	pixels_per_unit: number;
	public_enabled: boolean;
	share_token: string;
	settings_json: Record<string, unknown>;
	plan_objects?: PlanObject[];
	tables_count?: number;
	total_capacity?: number;
	assigned_guests_count?: number;
	background_image_url?: string | null;
	background_image_metadata?: {
		width: number;
		height: number;
		byte_size: number;
		content_type: string;
	} | null;
}
