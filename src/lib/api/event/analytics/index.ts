// Request types and schemas

// API endpoints
export {
	getAllEventAnalytics,
	getTotalAmountPrice,
	getTotalScannedTickets,
	getTotalTickets,
	getTotalUnscannedTickets,
	getWeeklyRegisteredTickets,
	getWeeklySalesAmount,
	getWeeklyScannedTickets,
} from "./endpoints";
export {
	type GetEventAnalyticsRequest,
	getEventAnalyticsSchema,
} from "./request";
// Response types
export type {
	AllEventAnalyticsResponse,
	DateCountColumn,
	TotalAmountPriceResponse,
	TotalScannedTicketsResponse,
	TotalTicketsResponse,
	TotalUnscannedTicketsResponse,
	WeeklyRegisteredTicketsResponse,
	WeeklySalesAmountResponse,
	WeeklyScannedTicketsResponse,
} from "./response";
