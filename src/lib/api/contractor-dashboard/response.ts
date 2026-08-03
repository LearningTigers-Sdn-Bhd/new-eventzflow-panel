// Contractor Dashboard API Response Types

export interface ContractorEventData {
	id: number;
	title: string;
	status: string;
	start_date: string;
	end_date: string;
	exhibitors_count: number;
	booths_count: number;
	total_received_amount: number;
	pending_payments_count: number;
	verified_payments_count: number;
}

export interface ContractorDashboardSummary {
	total_events: number;
	active_events: number;
	total_exhibitors: number;
	total_booths: number;
	total_received_amount: number;
	pending_payments_count: number;
	verified_payments_count: number;
}

export interface ContractorDashboardResponse {
	summary: ContractorDashboardSummary;
	events: ContractorEventData[];
}
