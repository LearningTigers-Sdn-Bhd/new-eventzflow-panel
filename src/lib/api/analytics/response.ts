// Response types matching backend API
export type GlobalAnalytics = {
	totalTickets: number;
	totalScannedTickets: number;
	totalUnscannedTickets: number;
	totalAmountPrice: number; // in cents
};

export type EventAnalytics = {
	totalTickets: number;
	totalScannedTickets: number;
	totalUnscannedTickets: number;
	totalAmountPrice: number; // in cents
};

// Backend response types
export type BackendTotalTicketsResponse = {
	totalTickets: number;
};

export type BackendTotalScannedTicketsResponse = {
	totalScannedTickets: number;
};

export type BackendTotalUnscannedTicketsResponse = {
	totalUnscannedTickets: number;
};

export type BackendTotalAmountPriceResponse = {
	totalAmountPrice: number;
};
