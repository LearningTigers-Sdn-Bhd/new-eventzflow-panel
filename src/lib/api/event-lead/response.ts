// Pure TypeScript types for API responses

export interface EventLead {
	id: number;
	leadable_type: "Visitor" | "Ticket";
	leadable_id: number;
	event_vendor_id: number;
	notes: string | null;
	scanned_by_id: number | null;
	created_at: string;
	lead: {
		name: string | null;
		email: string | null;
		phone: string | null;
		public_id: string | null;
	};
	event_vendor: {
		id: number;
		vendor_id: number;
		event_id: number;
		event_name?: string | null;
	};
	already_captured?: boolean;
}

export interface EventLeadWithDetails {
	id: number;
	leadable_type: "Visitor" | "Ticket";
	leadable_id: number;
	lead_name: string | null;
	lead_email: string | null;
	lead_phone: string | null;
	lead_public_id: string | null;
	event_vendor_id: number;
	event_id: number;
	event_name: string | null;
	vendor_name: string;
	notes: string | null;
	scanned_by_id: number | null;
	created_at: string;
}

export interface LeadAnalytics {
	event_vendor_id: number;
	lead_count: number;
}
