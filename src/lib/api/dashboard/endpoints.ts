import { restClient } from "@/utils/rest-api";
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
	BackendWeeklySalesResponse,
	BackendWeeklyScannedResponse,
	EventAnalytics,
	EventOverview,
	RecentScan,
} from "./response";

// Helper to convert cents to dollars
const centsToDollars = (cents: number): number => {
	return Math.round(cents / 100);
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
		// Ticket event stats
		totalTickets: event.total_tickets ?? 0,
		scannedTickets: event.scanned_tickets ?? 0,
		totalRevenue: centsToDollars(event.total_revenue ?? 0),
		pendingTickets: event.unscanned_tickets ?? 0,
		// Non-ticket event stats
		totalVisitors: event.total_visitors ?? 0,
		totalStamps: event.total_stamps ?? 0,
		lastActivity: event.last_activity,
	}));
}

/**
 * Get detailed analytics for a specific event
 */
export async function getEventAnalytics(
	eventId: string,
): Promise<EventAnalytics> {
	const eventIdNum = Number.parseInt(eventId, 10);

	// Fetch event details
	const event = await restClient.get<{
		id: number;
		title: string;
		status: string;
	}>(`v1/events/${eventIdNum}`);

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
		restClient.get<BackendAnalyticsResponse>(
			`v1/events/${eventIdNum}/metrics/total_tickets`,
		),
		restClient.get<BackendScannedTicketsResponse>(
			`v1/events/${eventIdNum}/metrics/total_scanned_tickets`,
		),
		restClient.get<BackendUnscannedTicketsResponse>(
			`v1/events/${eventIdNum}/metrics/total_unscanned_tickets`,
		),
		restClient.get<BackendRevenueResponse>(
			`v1/events/${eventIdNum}/metrics/total_amount_price`,
		),
		restClient.get<BackendWeeklyRegisteredResponse>(
			`v1/events/${eventIdNum}/metrics/weekly_registered`,
		),
		restClient.get<BackendWeeklyScannedResponse>(
			`v1/events/${eventIdNum}/metrics/weekly_scanned`,
		),
		restClient.get<BackendWeeklySalesResponse>(
			`v1/events/${eventIdNum}/metrics/weekly_sales_amount`,
		),
	]);

	// Fetch event locations to get count
	const locations = await restClient.get<Array<{ id: number }>>(
		`v1/events/${eventIdNum}/event_locations`,
	);

	// Fetch recent scans from backend (last 5 scanned tickets)
	const allTickets = await restClient.get<BackendTicket[]>(
		`v1/events/${eventIdNum}/tickets`,
	);

	// Filter for scanned tickets and get the 5 most recent
	const recentScannedTickets = allTickets
		.filter((ticket) => ticket.status === "scanned" && ticket.checked_in)
		.sort((a, b) => {
			const dateA = new Date(a.check_in_at || 0).getTime();
			const dateB = new Date(b.check_in_at || 0).getTime();
			return dateB - dateA; // Sort descending (most recent first)
		})
		.slice(0, 5);

	// Create a map of user_id -> location_name
	const locationsWithMembers = await restClient.get<BackendEventLocation[]>(
		`v1/events/${eventIdNum}/event_locations`,
	);

	const userLocationMap = new Map<number, string>();
	for (const location of locationsWithMembers) {
		// Combine staff_members and vendors arrays
		const allMembers = [
			...(location.staff_members || []),
			...(location.vendors || []),
		];
		
		for (const member of allMembers) {
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
		status: event.status as "draft" | "published" | "cancelled" | "completed",
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
