export interface SeatingGroupMember {
	id: number;
	participant_type: "Ticket" | "Visitor";
	participant_id: number;
	participant_name: string | null;
}

export interface SeatingGroup {
	id: number;
	event_id: number;
	plan_id: number | null;
	scope: "plan_only" | "event_level";
	name: string;
	notes: string | null;
	members: SeatingGroupMember[];
	created_at: string;
	updated_at: string;
}

export interface SeatingGroupAssignResult {
	success: boolean;
	group_id: number;
	assigned_count: number;
	plan_object_id: number;
}
