// Request types and schemas

// API endpoints
export {
	getGlobalScannedTickets,
	getGlobalTotalRevenue,
	getGlobalTotalTickets,
	getGlobalUnscannedTickets,
	getWeeklyRegisteredTickets,
	getWeeklySalesAmount,
	getWeeklyScannedTickets,
} from "./endpoints";
export {} from "./request";
// Response types
export type {
	BackendTotalAmountPriceResponse,
	BackendTotalScannedTicketsResponse,
	BackendTotalTicketsResponse,
	BackendTotalUnscannedTicketsResponse,
	BackendWeeklyRegisteredTicketsResponse,
	BackendWeeklySalesAmountResponse,
	BackendWeeklyScannedTicketsResponse,
	EventAnalytics,
	GlobalAnalytics,
	WeeklyDataPoint,
} from "./response";
