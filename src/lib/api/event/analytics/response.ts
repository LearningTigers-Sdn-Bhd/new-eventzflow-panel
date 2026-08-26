// Response types for analytics

export type TotalTicketsResponse = {
	totalTickets: number;
	paidTickets: number;
	pendingTickets: number;
};

export type TotalScannedTicketsResponse = {
	totalScannedTickets: number;
};

export type TotalUnscannedTicketsResponse = {
	totalUnscannedTickets: number;
};

export type TotalAmountPriceResponse = {
	totalAmountPrice: number;
	pendingAmountPrice: number;
};

export type PartnerAnalyticsBreakdown = {
	breakdownKey?: string;
	label: string;
	zone: string | null;
	boothType: string | null;
	packageLabel: string | null;
	bookedQuantity: number;
	paidQuantity: number;
	depositQuantity: number;
	unpaidQuantity: number;
	collectedRevenue: number;
	pendingRevenue: number;
};

export type PartnerAnalyticsFilterOptions = {
	zones: string[];
	boothPricing: string[];
};

export type PartnerAnalyticsResponse = {
	mode: "exhibitor" | "vendor";
	totalPartners: number;
	paidPartners: number;
	depositPartners: number;
	unpaidPartners: number;
	collectedRevenue: number;
	pendingRevenue: number;
	breakdown: PartnerAnalyticsBreakdown[];
	filterOptions?: PartnerAnalyticsFilterOptions;
	vendorMetrics: {
		totalLeads: number;
		voucherSales: number;
		voucherRedemptions: number;
	};
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
	paidTickets: number;
	pendingTickets: number;
	totalScannedTickets: number;
	totalUnscannedTickets: number;
	totalAmountPrice: number;
	pendingAmountPrice: number;
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

// Hourly breakdown types
export type HourlyDataPoint = {
	hour: string;
	value: number;
};

export type DailyHourlyBreakdown = {
	date: string;
	hourlyData: HourlyDataPoint[];
};

export type HourlyBreakdownByDayResponse = {
	metric: string;
	start_date: string;
	end_date: string;
	data: DailyHourlyBreakdown[];
};
