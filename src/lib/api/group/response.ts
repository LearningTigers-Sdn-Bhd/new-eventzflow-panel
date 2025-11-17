// Pure TypeScript types for API responses

export interface Group {
	id: number;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

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

export interface Vendor {
	id: number;
	email: string;
	full_name: string;
}

export interface GroupAffiliate {
	id: number;
	group_id: number;
	vendor_id: number;
	vendor: Vendor;
}

export interface GroupWithMembers extends Group {
	members: GroupMember[];
	vendors?: Vendor[]; // Multiple vendors support
	affiliates?: GroupAffiliate[]; // Multiple affiliates
	// Legacy support (deprecated)
	vendor?: Vendor;
	affiliate?: GroupAffiliate;
}
