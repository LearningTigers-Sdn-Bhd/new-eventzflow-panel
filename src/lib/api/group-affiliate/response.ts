// Pure TypeScript types for API responses

export interface GroupAffiliate {
	id: number;
	group_id: number;
	vendor_id: number;
	vendor: {
		id: number;
		email: string;
		full_name: string;
		role: string;
	};
}
