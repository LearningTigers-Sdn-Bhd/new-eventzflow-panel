// Backend API response type
export type BackendTeamMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "manager" | "member";
	status: "active" | "inactive";
	created_at: string;
	updated_at: string;
};

// Frontend team member type
export type TeamMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "manager" | "member";
	status: "active" | "inactive";
	createdAt: string;
	updatedAt: string;
};

// Response types for operations
export type CreateTeamMemberResponse = {
	success: boolean;
	member: TeamMember;
};

export type UpdateTeamMemberResponse = {
	success: boolean;
	member: TeamMember;
};

export type ToggleMemberStatusResponse = {
	success: boolean;
	member: TeamMember;
};

export type DeleteMemberResponse = {
	success: boolean;
	member: TeamMember;
};
