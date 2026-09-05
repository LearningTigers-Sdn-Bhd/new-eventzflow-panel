/**
 * Server-side API functions for Dashboard
 * These functions use native fetch and accept a token parameter since
 * Zustand store is not available in Server Components
 */

import type {
	AllEventsStats,
	BackendAllEventsStats,
	BackendAnalyticsResponse,
	BackendEventOverview,
	BackendRecentScansResponse,
	BackendRevenueResponse,
	BackendScannedTicketsResponse,
	BackendUnscannedTicketsResponse,
	EventAnalytics,
	EventOverview,
	RecentScan,
} from "./response";

// Time series response type
type TimeSeriesResponse = {
	metric: string;
	group_by: string;
	start_date: string;
	end_date: string;
	data: Array<{ period: string; value: number }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Helper to convert cents to dollars
 */
const centsToDollars = (cents: number): number => {
	return Math.round(cents / 100);
};

/**
 * Make authenticated fetch request from server
 */
async function serverFetch<T>(url: string, token: string): Promise<T> {
	const response = await fetch(`${API_URL}/${url}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		cache: "no-store", // Always fetch fresh data
	});

	if (!response.ok) {
		throw new Error(`Server fetch failed: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Get summary stats for all events (server-side version)
 */
export async function getAllEventsStatsServer(
	token: string,
): Promise<AllEventsStats> {
	const stats = await serverFetch<BackendAllEventsStats>(
		"v1/metrics/summary",
		token,
	);

	return {
		totalEvents: stats.total_events,
		activeEvents: stats.active_events,
		totalTickets: stats.total_tickets,
		totalRevenue: centsToDollars(stats.total_revenue),
		totalCheckins: stats.total_scanned,
		totalLocations: stats.total_locations,
		totalVisitors: stats.total_visitors,
		totalVendors: stats.total_vendors,
		totalVouchers: stats.total_vouchers,
		totalVouchersRedeemed: stats.total_vouchers_redeemed,
		ticketEvents: stats.ticket_events,
		nonTicketEvents: stats.non_ticket_events,
	};
}

/**
 * Get all events overview (server-side version)
 */
export async function getEventsOverviewServer(
	token: string,
): Promise<EventOverview[]> {
	const response = await serverFetch<{ events: BackendEventOverview[] }>(
		"v1/metrics/events_overview",
		token,
	);

	return response.events.map((event) => ({
		id: event.id.toString(),
		title: event.title,
		status: event.status as "draft" | "published" | "cancelled" | "completed",
		useTicket: event.use_ticket,
		useExhibitorKit: event.use_exhibitor_kit,
		totalTickets: event.total_tickets,
		scannedTickets: event.scanned_tickets,
		totalRevenue: centsToDollars(event.total_revenue),
		awaitingCheckingTickets: event.unscanned_tickets,
		totalVendors: event.total_vendors,
		totalExhibitors: event.total_exhibitors,
		paidExhibitors: event.paid_exhibitors,
		depositExhibitors: event.deposit_exhibitors,
		unpaidExhibitors: event.unpaid_exhibitors,
		totalVisitors: event.total_visitors,
		totalLeads: event.total_leads,
		lastActivity: event.last_activity,
	}));
}

/**
 * Get detailed analytics for a specific event (server-side version)
 */
export async function getEventAnalyticsServer(
	eventId: string,
	token: string,
): Promise<EventAnalytics> {
	const eventIdNum = Number.parseInt(eventId, 10);

	// Fetch event details
	const event = await serverFetch<{
		id: number;
		title: string;
		status: string;
	}>(`v1/events/${eventIdNum}`, token);

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
		serverFetch<BackendAnalyticsResponse>(
			`v1/events/${eventIdNum}/metrics/total_tickets`,
			token,
		),
		serverFetch<BackendScannedTicketsResponse>(
			`v1/events/${eventIdNum}/metrics/total_scanned_tickets`,
			token,
		),
		serverFetch<BackendUnscannedTicketsResponse>(
			`v1/events/${eventIdNum}/metrics/total_unscanned_tickets`,
			token,
		),
		serverFetch<BackendRevenueResponse>(
			`v1/events/${eventIdNum}/metrics/total_amount_price`,
			token,
		),
		serverFetch<TimeSeriesResponse>(
			`v1/events/${eventIdNum}/metrics/time_series?metric=tickets&group_by=day`,
			token,
		),
		serverFetch<TimeSeriesResponse>(
			`v1/events/${eventIdNum}/metrics/time_series?metric=scans&group_by=day`,
			token,
		),
		serverFetch<TimeSeriesResponse>(
			`v1/events/${eventIdNum}/metrics/time_series?metric=revenue&group_by=day`,
			token,
		),
		serverFetch<Array<{ id: number }>>(
			`v1/events/${eventIdNum}/event_locations`,
			token,
		),
		serverFetch<BackendRecentScansResponse>(
			`v1/events/${eventIdNum}/metrics/recent_scans?limit=5`,
			token,
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
		registrationData: ticketsTimeSeries.data.map((d) => ({
			date: d.period,
			value: d.value,
		})),
		scanData: scansTimeSeries.data.map((d) => ({
			date: d.period,
			value: d.value,
		})),
		revenueData: revenueTimeSeries.data.map((d) => ({
			date: d.period,
			value: centsToDollars(d.value),
		})),
	};
}
