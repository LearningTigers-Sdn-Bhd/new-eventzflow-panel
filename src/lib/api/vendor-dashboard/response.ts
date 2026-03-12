// Vendor Dashboard API Response Types

export interface VendorEventData {
	id: number;
	title: string;
	status: string;
	use_ticket: boolean;
	start_date: string;
	end_date: string;
	event_vendor_id: number;
	lead_count: number;
	total_vouchers: number;
	total_redeemed: number;
	redemption_rate: number;
}

export interface VendorDashboardSummary {
	total_events: number;
	active_events: number;
	total_leads: number;
	total_vouchers: number;
	total_redeemed: number;
}

export interface VendorDashboardResponse {
	summary: VendorDashboardSummary;
	events: VendorEventData[];
}
