/**
 * Server-side API functions for Dashboard
 * These functions use native fetch and accept a token parameter since
 * Zustand store is not available in Server Components
 */

import type {
	AllEventsStats,
	BackendAllEventsStats,
	BackendAnalyticsResponse,
	BackendEventLocation,
	BackendEventOverview,
	BackendRevenueResponse,
	BackendScannedTicketsResponse,
	BackendTicket,
	BackendUnscannedTicketsResponse,
	BackendWeeklyRegisteredResponse,
	BackendWeeklyScannedResponse,
	BackendWeeklySalesResponse,
	EventAnalytics,
	EventOverview,
	RecentScan,
} from "./response";

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
		"v1/analytics/summary",
		token,
	);

	return {
		totalEvents: stats.total_events,
		activeEvents: stats.active_events,
		totalTickets: stats.total_tickets,
		totalRevenue: centsToDollars(stats.total_revenue),
		totalCheckins: stats.total_scanned,
		totalLocations: stats.total_locations,
	};
}

/**
 * Get all events overview (server-side version)
 */
export async function getEventsOverviewServer(
	token: string,
): Promise<EventOverview[]> {
	const response = await serverFetch<{ events: BackendEventOverview[] }>(
		"v1/analytics/events_overview",
		token,
	);

	return response.events.map((event) => ({
		id: event.id.toString(),
		title: event.title,
		status: event.status === "published" ? ("active" as const) : ("inactive" as const),
		totalTickets: event.total_tickets,
		scannedTickets: event.scanned_tickets,
		totalRevenue: centsToDollars(event.total_revenue),
		pendingTickets: event.unscanned_tickets,
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

	// Fetch all analytics data in parallel
	const [
		totalTickets,
		scannedTickets,
		unscannedTickets,
		totalRevenue,
		weeklyRegistered,
		weeklyScanned,
		weeklySales,
	] = await Promise.all([
		serverFetch<BackendAnalyticsResponse>(
			`v1/events/${eventIdNum}/analytics/total_tickets`,
			token,
		),
		serverFetch<BackendScannedTicketsResponse>(
			`v1/events/${eventIdNum}/analytics/total_scanned_tickets`,
			token,
		),
		serverFetch<BackendUnscannedTicketsResponse>(
			`v1/events/${eventIdNum}/analytics/total_unscanned_tickets`,
			token,
		),
		serverFetch<BackendRevenueResponse>(
			`v1/events/${eventIdNum}/analytics/total_amount_price`,
			token,
		),
		serverFetch<BackendWeeklyRegisteredResponse>(
			`v1/events/${eventIdNum}/analytics/weekly_registered_tickets`,
			token,
		),
		serverFetch<BackendWeeklyScannedResponse>(
			`v1/events/${eventIdNum}/analytics/weekly_scanned_tickets`,
			token,
		),
		serverFetch<BackendWeeklySalesResponse>(
			`v1/events/${eventIdNum}/analytics/weekly_sales_amount`,
			token,
		),
	]);

	// Fetch event locations to get count
	const locations = await serverFetch<Array<{ id: number }>>(
		`v1/events/${eventIdNum}/event_locations`,
		token,
	);

	// Fetch recent scans from backend (last 5 scanned tickets)
	const allTickets = await serverFetch<BackendTicket[]>(
		`v1/events/${eventIdNum}/tickets`,
		token,
	);

	// Filter for scanned tickets and get the 5 most recent
	const recentScannedTickets = allTickets
		.filter((ticket) => ticket.status === "scanned" && ticket.checked_in)
		.sort((a, b) => {
			const dateA = new Date(a.check_in_at || 0).getTime();
			const dateB = new Date(b.check_in_at || 0).getTime();
			return dateB - dateA;
		})
		.slice(0, 5);

	// Create a map of user_id -> location_name
	const locationsWithMembers = await serverFetch<BackendEventLocation[]>(
		`v1/events/${eventIdNum}/event_locations`,
		token,
	);

	const userLocationMap = new Map<number, string>();
	for (const location of locationsWithMembers) {
		for (const member of location.members) {
			userLocationMap.set(member.id, location.name);
		}
	}

	// Map to RecentScan format
	const recentScans: RecentScan[] = recentScannedTickets.map((ticket) => {
		const scannedBy = ticket.scanned_by?.full_name || "Auto Check-in";
		const locationName = ticket.scanned_by_id
			? userLocationMap.get(ticket.scanned_by_id) || "General Access"
			: "N/A";

		return {
			id: ticket.public_id,
			ticketHolder: ticket.attendee_name,
			email: ticket.attendee_email,
			location: locationName,
			scannedBy,
			timestamp: ticket.check_in_at || new Date().toISOString(),
			status: "scanned",
		};
	});

	return {
		eventId: event.id.toString(),
		eventName: event.title,
		status: event.status === "published" ? "active" : "inactive",
		totalTickets: totalTickets.totalTickets,
		scannedTickets: scannedTickets.totalScannedTickets,
		unscannedTickets: unscannedTickets.totalUnscannedTickets,
		totalRevenue: centsToDollars(totalRevenue.totalAmountPrice),
		pendingTickets: unscannedTickets.totalUnscannedTickets,
		locations: locations.length,
		recentScans,
		registrationData: weeklyRegistered.weeklyRegisteredTickets.map((d) => ({
			date: d.date,
			value: d.count,
		})),
		scanData: weeklyScanned.weeklyScannedTickets.map((d) => ({
			date: d.date,
			value: d.count,
		})),
		revenueData: weeklySales.weeklySalesAmount.map((d) => ({
			date: d.date,
			value: centsToDollars(d.count),
		})),
	};
}
