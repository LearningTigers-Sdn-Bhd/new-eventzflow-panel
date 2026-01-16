// Response types for analytics

export type TotalTicketsResponse = {
	totalTickets: number;
};

export type TotalScannedTicketsResponse = {
	totalScannedTickets: number;
};

export type TotalUnscannedTicketsResponse = {
	totalUnscannedTickets: number;
};

export type TotalAmountPriceResponse = {
	totalAmountPrice: number;
};

// Visitor analytics response types
export type TotalVisitorsResponse = {
	totalVisitors: number;
};

export type TotalScannedVisitorsResponse = {
	totalScannedVisitors: number;
};

export type TotalUnscannedVisitorsResponse = {
	totalUnscannedVisitors: number;
};

// Time series data point
export type TimeSeriesDataPoint = {
	period: string;
	value: number;
};

// Time series response from backend
export type TimeSeriesResponse = {
	metric: string;
	group_by: string;
	start_date: string;
	end_date: string;
	data: TimeSeriesDataPoint[];
};

// Legacy format for backward compatibility with charts
export type DateCountColumn = {
	date: string;
	count: number;
};

// Aggregated analytics response
export type AllEventAnalyticsResponse = {
	totalTickets: number;
	totalScannedTickets: number;
	totalUnscannedTickets: number;
	totalAmountPrice: number;
	registrationData: DateCountColumn[];
	scanData: DateCountColumn[];
	revenueData: DateCountColumn[];
};

// Mall Live Feed types
export type TopMerchant = {
	name: string;
	count: number;
};

export type PopularHall = {
	name: string;
	percentage: number;
};

export type MallLiveFeedResponse = {
	shoppers_registered_today: number;
	estimated_sales_today: number;
	voucher_issuances: number;
	voucher_redemptions: number;
	redemption_rate: number;
	top_merchants: TopMerchant[];
	popular_halls: PopularHall[];
};
