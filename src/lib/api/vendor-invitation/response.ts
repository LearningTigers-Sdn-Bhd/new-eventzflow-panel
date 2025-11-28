export interface GenerateInviteLinkResponse {
	success: boolean;
	message: string;
	data: {
		invite_url: string;
		token: string;
		expires_at: string;
		event: {
			id: number;
			title: string;
		};
	};
}

export interface VerifyInviteTokenResponse {
	success: boolean;
	message: string;
	data: {
		valid: boolean;
		expires_at: string;
		is_authenticated: boolean;
		is_assigned: boolean;
		event: {
			id: number;
			title: string;
			description: string | null;
			start_date: string | null;
			end_date: string | null;
		};
	};
}

export interface CheckAccountResponse {
	success: boolean;
	message: string;
	data: {
		exists: boolean;
		identifier_type: "email" | "phone";
		masked_identifier?: string;
	};
}

export interface RegisterInvitedVendorResponse {
	success: boolean;
	message: string;
	data: {
		user: {
			id: number;
			full_name: string;
			email: string;
			role: string;
			phone: string | null;
			email_verified: boolean;
		};
		event_vendor: {
			id: number;
			event_id: number;
			event_title: string;
			type: string;
		};
		access_token: string;
		refresh_token: string;
		expires_at: string;
	};
}
