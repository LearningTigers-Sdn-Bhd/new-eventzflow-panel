import { restClient } from "@/utils/rest-api";
import type {
	AllEventsStats,
	BackendAllEventsStats,
	BackendAnalyticsResponse,
	BackendEventOverview,
	BackendRecentScansResponse,
	BackendRevenueResponse,
	BackendScannedTicketsResponse,
	BackendUnscannedTicketsResponse,
	DailyHourlyBreakdown,
	EventAnalytics,
	EventOverview,
	HourlyBreakdownByDayResponse,
	RecentScan,
} from "./response";

// Helper to convert cents to dollars
const centsToDollars = (cents: number): number => {
	return Math.round(cents / 100);
};

// Time series response type
type TimeSeriesResponse = {
	metric: string;
	group_by: string;
	start_date: string;
	end_date: string;
	data: Array<{ period: string; value: number }>;
};

/**
 * Get summary stats for all events (for quick overview)
 */
export async function getAllEventsStats(): Promise<AllEventsStats> {
	const stats =
		await restClient.get<BackendAllEventsStats>("v1/metrics/summary");

	return {
		totalEvents: stats.total_events,
		activeEvents: stats.active_events,
		totalTickets: stats.total_tickets,
		totalRevenue: centsToDollars(stats.total_revenue),
		totalCheckins: stats.total_scanned,
		totalLocations: stats.total_locations,
		// Non-ticket event stats
		totalVisitors: stats.total_visitors ?? 0,
		totalVendors: stats.total_vendors ?? 0,
		totalVouchers: stats.total_vouchers ?? 0,
		totalVouchersRedeemed: stats.total_vouchers_redeemed ?? 0,
		// Event type counts
		ticketEvents: stats.ticket_events ?? 0,
		nonTicketEvents: stats.non_ticket_events ?? 0,
	};
}

/**
 * Get all events overview (for dashboard landing)
 */
export async function getEventsOverview(): Promise<EventOverview[]> {
	const response = await restClient.get<{
		events: BackendEventOverview[];
	}>("v1/metrics/events_overview");

	// Transform backend response to frontend format
	return response.events.map((event) => ({
		id: event.id.toString(),
		title: event.title,
		status: event.status as "draft" | "published" | "cancelled" | "completed",
		useTicket: event.use_ticket ?? true,
		useExhibitorKit: event.use_exhibitor_kit ?? false,
		// Ticket event stats
		totalTickets: event.total_tickets ?? 0,
		scannedTickets: event.scanned_tickets ?? 0,
		totalRevenue: centsToDollars(event.total_revenue ?? 0),
		awaitingCheckingTickets: event.unscanned_tickets ?? 0,
		// Vendor / exhibitor stats
		totalVendors: event.total_vendors ?? 0,
		totalExhibitors: event.total_exhibitors ?? 0,
		paidExhibitors: event.paid_exhibitors ?? 0,
		depositExhibitors: event.deposit_exhibitors ?? 0,
		unpaidExhibitors: event.unpaid_exhibitors ?? 0,
		// Non-ticket event stats
		totalVisitors: event.total_visitors ?? 0,
		totalLeads: event.total_leads ?? 0,
		lastActivity: event.last_activity,
	}));
}

/**
 * Get detailed analytics for a specific event
 */
export async function getEventAnalytics(
	eventId: string,
	options?: {
		startDate?: string;
		endDate?: string;
		dateMode?: "all_time" | "pre_event";
		groupBy?: "hour" | "day" | "week" | "month";
		includeMultiScans?: boolean;
	},
): Promise<EventAnalytics> {
	const eventIdNum = Number.parseInt(eventId, 10);

	// Build time series URL with optional params
	const buildTimeSeriesUrl = (metric: string) => {
		const params = new URLSearchParams();
		params.set("metric", metric);
		if (options?.groupBy) params.set("group_by", options.groupBy);
		if (options?.dateMode) params.set("date_mode", options.dateMode);
		if (options?.startDate) params.set("start_date", options.startDate);
		if (options?.endDate) params.set("end_date", options.endDate);
		if (metric === "scans" && options?.includeMultiScans) {
			params.set("include_multi_scans", "true");
		}
		return `v1/events/${eventIdNum}/metrics/time_series?${params.toString()}`;
	};

	// Shared date-range params so the summary cards (totals/revenue) are scoped
	// to the same filter as the Analytics Trends charts.
	const dateRangeParams = new URLSearchParams();
	if (options?.dateMode) dateRangeParams.set("date_mode", options.dateMode);
	if (options?.startDate) dateRangeParams.set("start_date", options.startDate);
	if (options?.endDate) dateRangeParams.set("end_date", options.endDate);

	const totalTicketsParams = new URLSearchParams(dateRangeParams);
	if (options?.includeMultiScans) {
		totalTicketsParams.set("include_multi_scans", "true");
	}

	const scannedTicketsParams = new URLSearchParams(dateRangeParams);
	if (options?.includeMultiScans) {
		scannedTicketsParams.set("include_multi_scans", "true");
	}

	// Fetch event details
	const event = await restClient.get<{
		id: number;
		title: string;
		status: string;
	}>(`v1/events/${eventIdNum}`);

	// Fetch all analytics data in parallel (using new time_series endpoint).
	// Recent scans come from a dedicated backend query (ScanLog, limit 5) —
	// never dump the full ticket table just to sort/slice client-side.
	const [
		totalTickets,
		scannedTickets,
		unscannedTickets,
		totalRevenue,
		ticketsTimeSeries,
		scansTimeSeries,
		revenueTimeSeries,
		locations,
		recentScansResponse,
	] = await Promise.all([
		restClient.get<BackendAnalyticsResponse>(
			`v1/events/${eventIdNum}/metrics/total_tickets?${totalTicketsParams.toString()}`,
		),
		restClient.get<BackendScannedTicketsResponse>(
			`v1/events/${eventIdNum}/metrics/total_scanned_tickets?${scannedTicketsParams.toString()}`,
		),
		restClient.get<BackendUnscannedTicketsResponse>(
			`v1/events/${eventIdNum}/metrics/total_unscanned_tickets?${dateRangeParams.toString()}`,
		),
		restClient.get<BackendRevenueResponse>(
			`v1/events/${eventIdNum}/metrics/total_amount_price?${dateRangeParams.toString()}`,
		),
		restClient.get<TimeSeriesResponse>(buildTimeSeriesUrl("tickets")),
		restClient.get<TimeSeriesResponse>(buildTimeSeriesUrl("scans")),
		restClient.get<TimeSeriesResponse>(buildTimeSeriesUrl("revenue")),
		restClient.get<Array<{ id: number }>>(
			`v1/events/${eventIdNum}/event_locations`,
		),
		restClient.get<BackendRecentScansResponse>(
			`v1/events/${eventIdNum}/metrics/recent_scans?limit=5`,
		),
	]);

	const recentScans: RecentScan[] = recentScansResponse.recentScans;

	return {
		eventId: event.id.toString(),
		eventName: event.title,
		status: event.status as "draft" | "published" | "cancelled" | "completed",
		totalTickets: totalTickets.totalTickets,
		paidTickets: totalTickets.paidTickets,
		pendingTickets: totalTickets.pendingTickets,
		totalVisitors: totalTickets.totalVisitors,
		scannedTickets: scannedTickets.totalScannedTickets,
		unscannedTickets: unscannedTickets.totalUnscannedTickets,
		totalRevenue: centsToDollars(totalRevenue.totalAmountPrice),
		pendingRevenue: centsToDollars(totalRevenue.pendingAmountPrice),
		locations: locations.length,
		recentScans,
		registrationData: (ticketsTimeSeries.data ?? []).map((d) => ({
			date: d.period,
			value: d.value,
		})),
		scanData: (scansTimeSeries.data ?? []).map((d) => ({
			date: d.period,
			value: d.value,
		})),
		revenueData: (revenueTimeSeries.data ?? []).map((d) => ({
			date: d.period,
			value: centsToDollars(d.value),
		})),
	};
}

/**
 * Get hourly breakdown by day for a specific event metric
 * Returns hourly data grouped by day - useful for multi-day event reports
 */
export async function getHourlyBreakdownByDay(
	eventId: string,
	metric:
		| "tickets"
		| "scans"
		| "visitors"
		| "visitor_scans"
		| "leads"
		| "redemptions",
	options?: {
		startDate?: string;
		endDate?: string;
		dateMode?: "all_time" | "pre_event";
	},
): Promise<DailyHourlyBreakdown[]> {
	const eventIdNum = Number.parseInt(eventId, 10);

	const params = new URLSearchParams();
	params.set("metric", metric);
	if (options?.dateMode) params.set("date_mode", options.dateMode);
	if (options?.startDate) params.set("start_date", options.startDate);
	if (options?.endDate) params.set("end_date", options.endDate);

	const response = await restClient.get<HourlyBreakdownByDayResponse>(
		`v1/events/${eventIdNum}/metrics/hourly_breakdown_by_day?${params.toString()}`,
	);

	return response.data ?? [];
}
