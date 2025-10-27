import { z } from "zod";
import { protectedProcedure, router } from "../../index";
import { protectedHttpClient } from "../../lib/http-client";
import type { ScannedLog } from "./type";

// Backend user type (from Rails API)
type BackendUser = {
	id: number;
	full_name: string;
	email: string;
};

// Backend ticket response type (from Rails API)
type BackendTicket = {
	id: number;
	public_id: string;
	event_id: number;
	ticket_type_id: number;
	attendee_name: string;
	attendee_email: string;
	attendee_phone: string | null;
	checked_in: boolean;
	check_in_at: string | null;
	scanned_by_id: number | null;
	scanned_by?: BackendUser | null; // User who scanned the ticket
	status: "purchased" | "scanned" | "refunded" | "canceled";
	created_at: string;
	updated_at: string;
	ticket_type?: {
		id: number;
		name: string;
		price: string;
	};
};

/**
 * Maps backend ticket data to frontend ScannedLog format
 * @param ticket - The backend ticket data
 * @param userLocationMap - Map of user_id to location name
 */
function mapTicketToScannedLog(
	ticket: BackendTicket,
	userLocationMap: Map<number, string>,
): ScannedLog {
	// Determine who scanned the ticket
	let scannedBy = "Auto Check-in"; // Default for null scanned_by_id
	
	if (ticket.scanned_by) {
		// If scanned_by user data is available, use their full name
		scannedBy = ticket.scanned_by.full_name;
	} else if (ticket.scanned_by_id) {
		// Fallback if we have ID but no user data (shouldn't happen with proper includes)
		scannedBy = `Staff ID: ${ticket.scanned_by_id}`;
	}

	// Get location name from the map
	const locationName = ticket.scanned_by_id 
		? (userLocationMap.get(ticket.scanned_by_id) || "General Access")
		: "N/A";

	return {
		id: ticket.public_id, // Use public_id as the display ID
		name: ticket.attendee_name,
		email: ticket.attendee_email,
		phone: ticket.attendee_phone || "N/A",
		locationName,
		scannedBy,
		status: ticket.status === "scanned" ? "scanned" : "not_scanned",
		checkedInAt: ticket.check_in_at || ticket.created_at,
	};
}

export const scanLogRouter = router({
	/**
	 * Get all scanned logs for an event
	 * Fetches tickets from the Rails backend API
	 */
	getScanLogs: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ input, ctx }) => {
			try {
				const { eventId } = input;
				const token = ctx.token;

				if (!token) {
					console.error("❌ No access token available for scan logs request");
					return [];
				}

				console.log(`🔍 Fetching scan logs for event ${eventId}...`);

				// Fetch both tickets and locations in parallel
				const [tickets, locations] = await Promise.all([
					protectedHttpClient.get<BackendTicket[]>(
						`v1/events/${eventId}/tickets`,
						token,
					),
					protectedHttpClient.get<
						Array<{
							id: number;
							name: string;
							members: Array<{ id: number; full_name: string; email: string }>;
						}>
					>(`v1/events/${eventId}/event_locations`, token),
				]);

				console.log(`✅ Fetched ${tickets.length} tickets from backend`);
				console.log(`✅ Fetched ${locations.length} locations from backend`);

				// Create a map of user_id -> location_name
				const userLocationMap = new Map<number, string>();
				for (const location of locations) {
					for (const member of location.members) {
						userLocationMap.set(member.id, location.name);
					}
				}

				console.log(`✅ Created location map with ${userLocationMap.size} members`);

				// Filter for scanned tickets only
				const scannedTickets = tickets.filter(
					(ticket) => ticket.status === "scanned" && ticket.checked_in,
				);

				console.log(`✅ Found ${scannedTickets.length} scanned tickets`);

				// Map tickets to ScannedLog format with location data
				const scanLogs: ScannedLog[] = scannedTickets.map((ticket) =>
					mapTicketToScannedLog(ticket, userLocationMap),
				);

				console.log(`✅ Mapped ${scanLogs.length} scan logs`);

				return scanLogs;
			} catch (error) {
				console.error("❌ Error fetching scan logs:", error);
				// Return empty array on error to prevent UI breakage
				return [];
			}
		}),
});
