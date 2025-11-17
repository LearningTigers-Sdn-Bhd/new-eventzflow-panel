// Pure TypeScript types for API responses

export interface VisitorStamp {
	id: number;
	visitor_id: number;
	event_vendor_id: number;
	created_at: string;
}

export interface VisitorStampWithDetails {
	id: number;
	visitor_id: number;
	visitor_name: string;
	visitor_email: string;
	visitor_phone: string;
	visitor_public_id: string;
	event_vendor_id: number;
	vendor_name: string;
	created_at: string;
}

export interface StampAnalytics {
	event_vendor_id: number;
	stamp_count: number;
	unique_visitors: number;
}
