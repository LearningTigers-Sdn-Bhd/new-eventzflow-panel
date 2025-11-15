// Backend response types
export type BackendEventStaffResponse = {
	id: number;
	event_id: number;
	user_id: string;
	role: "event_admin" | "event_team_member";
	user: {
		id: string;
		email: string;
		full_name: string;
		phone: string | null;
		role: number; // 0=org_owner, 1=organizer, 2=member
		status: number; // 1=active, 0=inactive
	};
};

export type BackendUser = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "organizer" | "member";
	status: "active" | "inactive";
	created_at: string;
	updated_at: string;
};

export type BackendEventAssignment = {
	id: number;
	event_id: number;
	user_id: string;
	role: "event_admin" | "event_team_member";
	created_at: string;
	updated_at: string;
};

// Frontend types
export type EventStaffMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	globalRole: "org_owner" | "organizer" | "member";
	eventRole: "event_admin" | "event_team_member";
	status: "active" | "inactive";
	assignmentId: number;
	createdAt: string;
	updatedAt: string;
};

export type AvailableTeamMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "organizer" | "member";
	status: "active" | "inactive";
};

// Response types for operations
export type AssignStaffResponse = {
	success: boolean;
	assignment: BackendEventAssignment;
};

export type RemoveStaffResponse = {
	success: boolean;
};

export type UpdateStaffRoleResponse = {
	success: boolean;
	assignment: BackendEventAssignment;
};
