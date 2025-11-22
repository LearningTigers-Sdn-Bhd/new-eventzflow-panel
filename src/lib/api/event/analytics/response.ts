// Mock data for analytics
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

export type DateCountColumn = {
	date: string;
	count: number;
};

export type WeeklyRegisteredTicketsResponse = {
	weeklyRegisteredTickets: DateCountColumn[];
};

export type WeeklyScannedTicketsResponse = {
	weeklyScannedTickets: DateCountColumn[];
};

export type WeeklySalesAmountResponse = {
	weeklySalesAmount: DateCountColumn[];
};

// Aggregated analytics response
export type AllEventAnalyticsResponse = {
	totalTickets: number;
	totalScannedTickets: number;
	totalUnscannedTickets: number;
	totalAmountPrice: number;
	weeklyRegisteredTickets: DateCountColumn[];
	weeklyScannedTickets: DateCountColumn[];
	weeklySalesAmount: DateCountColumn[];
};

// Mall Live Feed types
export type TopMerchant = {
	name: string;
	count: number;
};

export type LocationTraffic = {
	name: string;
	count: number;
};

export type MallLiveFeedResponse = {
	shoppers_registered_today: number;
	estimated_sales_today: number;
	voucher_issuances: number;
	voucher_redemptions: number;
	redemption_rate: number;
	top_merchants: TopMerchant[];
	location_traffic: LocationTraffic[];
};
