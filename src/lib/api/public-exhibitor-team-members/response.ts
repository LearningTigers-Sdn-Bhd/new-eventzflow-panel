export interface PublicExhibitorTeamMember {
	id: number;
	full_name: string;
	email: string;
	phone: string;
}

export interface PublicExhibitorKitTeamMembers {
	public_id: string;
	company_name: string | null;
	booth_number: string | null;
	event_title: string;
	team_member_limit: number | null;
	extra_team_member_fee: number | string;
	team_members: PublicExhibitorTeamMember[];
}
