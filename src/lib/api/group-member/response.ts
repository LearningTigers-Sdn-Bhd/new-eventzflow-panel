// Pure TypeScript types for API responses

export interface GroupMember {
	id: number;
	user_id: number;
	group_id: number;
	has_manager_access: boolean;
	user: {
		id: number;
		email: string;
		full_name: string;
		role: "org_owner" | "manager" | "member";
	};
}

export interface AvailableMember {
	id: number | string;
	email: string;
	full_name: string;
	phone?: string;
	role: "org_owner" | "manager" | "member";
	status: "active" | "inactive";
}
