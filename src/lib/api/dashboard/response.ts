// Pure TypeScript types for API responses

// Frontend types (transformed from backend)
export type AllEventsStats = {
	totalEvents: number;
	activeEvents: number;
	totalTickets: number;
	totalRevenue: number;
	totalCheckins: number;
	totalLocations: number;
};

export type EventOverview = {
	id: string;
	title: string;
	status: "active" | "inactive";
	totalTickets: number;
	scannedTickets: number;
	totalRevenue: number;
	pendingTickets: number;
	lastActivity: string;
};

export type ChartDataPoint = {
	date: string;
	value: number;
};

export type RecentScan = {
	id: string;
	ticketHolder: string;
	email: string;
	location: string;
	scannedBy: string;
	timestamp: string;
	status: "scanned";
};

export type EventAnalytics = {
	eventId: string;
	eventName: string;
	status: "active" | "inactive";
	totalTickets: number;
	scannedTickets: number;
	unscannedTickets: number;
	totalRevenue: number;
	pendingTickets: number;
	locations: number;
	recentScans: RecentScan[];
	registrationData: ChartDataPoint[];
	scanData: ChartDataPoint[];
	revenueData: ChartDataPoint[];
};

// Backend response types (raw API responses)
export type BackendAllEventsStats = {
	total_events: number;
	active_events: number;
	total_tickets: number;
	total_revenue: number;
	total_scanned: number;
	total_locations: number;
};

export type BackendEventOverview = {
	id: number;
	title: string;
	status: string;
	total_tickets: number;
	scanned_tickets: number;
	total_revenue: number;
	unscanned_tickets: number;
	last_activity: string;
};

export type BackendAnalyticsResponse = {
	totalTickets: number;
};

export type BackendScannedTicketsResponse = {
	totalScannedTickets: number;
};

export type BackendUnscannedTicketsResponse = {
	totalUnscannedTickets: number;
};

export type BackendRevenueResponse = {
	totalAmountPrice: number;
};

export type BackendWeeklyRegisteredResponse = {
	weeklyRegisteredTickets: Array<{
		date: string;
		count: number;
	}>;
};

export type BackendWeeklyScannedResponse = {
	weeklyScannedTickets: Array<{
		date: string;
		count: number;
	}>;
};

export type BackendWeeklySalesResponse = {
	weeklySalesAmount: Array<{
		date: string;
		count: number;
	}>;
};

export type BackendTicket = {
	id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone: string;
	ticket_type_name: string;
	value: number;
	checked_in: boolean;
	check_in_at: string | null;
	event_name: string;
	event_id: number;
	custom_labels: string[];
	status: string;
	scanned_by?: {
		full_name: string;
	};
	scanned_by_id?: number;
};

export type BackendEventLocation = {
	id: number;
	name: string;
	members: Array<{
		id: number;
		full_name: string;
	}>;
};
