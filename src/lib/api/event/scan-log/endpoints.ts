import { restClient } from "@/utils/rest-api";
import { type GetScanLogsRequest, getScanLogsSchema } from "./request";
import type { BackendTicket, ScannedLog } from "./response";

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
		? userLocationMap.get(ticket.scanned_by_id) || "General Access"
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

/**
 * Get all scanned logs for an event
 * Fetches tickets from the Rails backend API
 */
export async function getScanLogs(
	data: GetScanLogsRequest,
): Promise<ScannedLog[]> {
	try {
		const validated = getScanLogsSchema.parse(data);
		const { eventId } = validated;

		console.log(`🔍 Fetching scan logs for event ${eventId}...`);

		// Fetch both tickets and locations in parallel
		const [tickets, locations] = await Promise.all([
			restClient.get<BackendTicket[]>(`v1/events/${eventId}/tickets`),
			restClient.get<
				Array<{
					id: number;
					name: string;
					staff_members?: Array<{
						id: number;
						full_name: string;
						email: string;
					}>;
					vendors?: Array<{ id: number; full_name: string; email: string }>;
				}>
			>(`v1/events/${eventId}/event_locations`),
		]);

		console.log(`✅ Fetched ${tickets.length} tickets from backend`);
		console.log(`✅ Fetched ${locations.length} locations from backend`);

		// Create a map of user_id -> location_name
		const userLocationMap = new Map<number, string>();
		for (const location of locations) {
			// Combine staff_members and vendors arrays
			const allMembers = [
				...(location.staff_members || []),
				...(location.vendors || []),
			];

			for (const member of allMembers) {
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
	} catch (error: any) {
		console.error("❌ Error fetching scan logs:", error);
		// Return empty array on error to prevent UI breakage
		return [];
	}
}
