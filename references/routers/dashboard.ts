import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { protectedHttpClient } from "../lib/http-client";
import type { Event } from "./event";

export type EventAnalytics = {
	eventId: string;
	eventName: string;
	status: "active" | "inactive";
	totalTickets: number;
	scannedTickets: number;
	unscannedTickets: number;
	totalRevenue: number;
	pendingTickets: number;
	locations: number;
	recentScans: RecentScan[];
	registrationData: ChartDataPoint[];
	scanData: ChartDataPoint[];
	revenueData: ChartDataPoint[];
};

export type RecentScan = {
	id: string;
	ticketHolder: string;
	email: string;
	location: string;
	scannedBy: string;
	timestamp: string;
	status: "scanned" | "duplicate";
};

export type ChartDataPoint = {
	date: string;
	value: number;
};

export type EventOverview = {
	id: string;
	title: string;
	status: "active" | "inactive";
	totalTickets: number;
	scannedTickets: number;
	totalRevenue: number;
	pendingTickets: number;
	lastActivity?: string;
};

// Helper to convert cents to dollars
const centsToDollars = (cents: number): number => {
	return Math.round(cents / 100);
};

export const dashboardRouter = router({
	// Get all events overview (for dashboard landing) - OPTIMIZED
	getEventsOverview: protectedProcedure.query<EventOverview[]>(
		async ({ ctx }) => {
			// Single API call to get all events with their analytics
			const response = await protectedHttpClient.get<{
				events: Array<{
					id: number;
					title: string;
					status: string;
					total_tickets: number;
					scanned_tickets: number;
					unscanned_tickets: number;
					total_revenue: number;
					last_activity: string;
				}>;
			}>("v1/analytics/events_overview", ctx.token);

			// Transform backend response to frontend format
			return response.events.map((event) => ({
				id: event.id.toString(),
				title: event.title,
				status:
					event.status === "published"
						? ("active" as const)
						: ("inactive" as const),
				totalTickets: event.total_tickets,
				scannedTickets: event.scanned_tickets,
				totalRevenue: centsToDollars(event.total_revenue),
				pendingTickets: event.unscanned_tickets,
				lastActivity: event.last_activity,
			}));
		},
	),

	// Get detailed analytics for a specific event
	getEventAnalytics: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.query<EventAnalytics>(async ({ input, ctx }) => {
			const eventId = Number.parseInt(input.eventId, 10);

			// Fetch event details
			const event = await protectedHttpClient.get<Event>(
				`v1/events/${eventId}`,
				ctx.token,
			);

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
				protectedHttpClient.get<{ totalTickets: number }>(
					`v1/events/${eventId}/analytics/total_tickets`,
					ctx.token,
				),
				protectedHttpClient.get<{ totalScannedTickets: number }>(
					`v1/events/${eventId}/analytics/total_scanned_tickets`,
					ctx.token,
				),
				protectedHttpClient.get<{ totalUnscannedTickets: number }>(
					`v1/events/${eventId}/analytics/total_unscanned_tickets`,
					ctx.token,
				),
				protectedHttpClient.get<{ totalAmountPrice: number }>(
					`v1/events/${eventId}/analytics/total_amount_price`,
					ctx.token,
				),
				protectedHttpClient.get<{
					weeklyRegisteredTickets: Array<{ date: string; count: number }>;
				}>(
					`v1/events/${eventId}/analytics/weekly_registered_tickets`,
					ctx.token,
				),
				protectedHttpClient.get<{
					weeklyScannedTickets: Array<{ date: string; count: number }>;
				}>(`v1/events/${eventId}/analytics/weekly_scanned_tickets`, ctx.token),
				protectedHttpClient.get<{
					weeklySalesAmount: Array<{ date: string; count: number }>;
				}>(`v1/events/${eventId}/analytics/weekly_sales_amount`, ctx.token),
			]);

			// Fetch event locations to get count
			const locations = await protectedHttpClient.get<Array<{ id: number }>>(
				`v1/events/${eventId}/event_locations`,
				ctx.token,
			);

			// Fetch recent scans from backend (last 5 scanned tickets)
			const allTickets = await protectedHttpClient.get<
				Array<{
					id: number;
					public_id: string;
					attendee_name: string;
					attendee_email: string;
					checked_in: boolean;
					check_in_at: string | null;
					status: string;
					scanned_by?: {
						id: number;
						full_name: string;
						email: string;
					} | null;
					scanned_by_id: number | null;
				}>
			>(`v1/events/${eventId}/tickets`, ctx.token);

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
			const locationsWithMembers = await protectedHttpClient.get<
				Array<{
					id: number;
					name: string;
					members: Array<{ id: number; full_name: string; email: string }>;
				}>
			>(`v1/events/${eventId}/event_locations`, ctx.token);

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
		}),

	// Get summary stats for all events (for quick overview) - OPTIMIZED
	getAllEventsStats: protectedProcedure.query(async ({ ctx }) => {
		// Single API call to get all aggregated stats
		const stats = await protectedHttpClient.get<{
			total_events: number;
			active_events: number;
			total_tickets: number;
			total_scanned: number;
			total_revenue: number;
			total_locations: number;
		}>("v1/analytics/summary", ctx.token);

		return {
			totalEvents: stats.total_events,
			activeEvents: stats.active_events,
			totalTickets: stats.total_tickets,
			totalRevenue: centsToDollars(stats.total_revenue),
			totalCheckins: stats.total_scanned,
			totalLocations: stats.total_locations,
		};
	}),
});
