// Pure TypeScript types for API responses

export interface Visitor {
	id: number;
	event_id: number;
	public_id: string;
	full_name: string;
	email: string;
	phone: string;
	gender?: string;
	age?: number;
	created_at: string;
	updated_at: string;
}
