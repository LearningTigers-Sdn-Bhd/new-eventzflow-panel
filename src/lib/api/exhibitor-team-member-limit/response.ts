// Pure TypeScript types for API responses

export interface ExhibitorTeamMemberLimit {
	id: number;
	event_id: number;
	team_member_limit: number;
	extra_team_member_fee: string;
	has_limit: boolean;
	charges_extra_fee: boolean;
	is_configured: boolean;
	created_at: string;
	updated_at: string;
}

// Response when no limit is configured
export interface ExhibitorTeamMemberLimitNotConfigured {
	data: null;
	message: string;
	is_configured: false;
}

// Fields included in exhibitor_kit response
export interface ExhibitorKitTeamMemberInfo {
	team_member_count: number;
	team_member_limit: number | null;
	excess_team_member_count: number;
	exceeds_team_member_limit: boolean;
	extra_team_member_fee: string;
	extra_team_member_charges: string;
}
