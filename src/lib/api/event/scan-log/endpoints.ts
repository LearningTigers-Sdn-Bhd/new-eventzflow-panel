import { restClient } from "@/utils/rest-api";
import { type GetScanLogsRequest, getScanLogsSchema } from "./request";
import type { BackendTicket, ScannedLog, ScanLogBackendCheckIn } from "./response";

/**
 * Maps a single check-in record to frontend ScannedLog format
 * @param ticket - The backend ticket data
 * @param checkIn - The specific check-in record
 * @param userLocationMap - Map of user_id to location name
 */
function mapCheckInToScannedLog(
	ticket: BackendTicket,
	checkIn: ScanLogBackendCheckIn,
	userLocationMap: Map<number, string>,
): ScannedLog {
	// Determine who scanned the ticket
	let scannedBy = "Public Check-in";
	let scannedById: number | null = null;

	if (checkIn.scanned_by) {
		scannedBy = checkIn.scanned_by.full_name;
		scannedById = checkIn.scanned_by.id;
	}

	// Get location name from the map
	const locationName = scannedById
		? userLocationMap.get(scannedById) || "General Access"
		: "N/A";

	return {
		id: `${ticket.public_id}_${checkIn.id}`, // Unique ID per check-in
		ticketId: ticket.public_id,
		checkInId: checkIn.id,
		name: ticket.attendee_name,
		email: ticket.attendee_email,
		phone: ticket.attendee_phone || "N/A",
		locationName,
		scannedBy,
		status: "scanned",
		checkedInAt: checkIn.check_in_at,
	};
}

/**
 * Get all scanned logs for an event
 * Fetches tickets from the Rails backend API
 * Returns one log entry per check-in (not per ticket) for multi-day support
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

		// Map each check-in to a separate log entry (not just 1 per ticket)
		const scanLogs: ScannedLog[] = [];
		for (const ticket of scannedTickets) {
			if (ticket.check_ins && ticket.check_ins.length > 0) {
				// Create a log entry for each check-in
				for (const checkIn of ticket.check_ins) {
					scanLogs.push(mapCheckInToScannedLog(ticket, checkIn, userLocationMap));
				}
			} else {
				// Fallback for tickets without check_ins data (legacy)
				scanLogs.push({
					id: ticket.public_id,
					ticketId: ticket.public_id,
					name: ticket.attendee_name,
					email: ticket.attendee_email,
					phone: ticket.attendee_phone || "N/A",
					locationName: "N/A",
					scannedBy: "Unknown",
					status: "scanned",
					checkedInAt: ticket.created_at,
				});
			}
		}

		console.log(`✅ Mapped ${scanLogs.length} scan logs (including multi-day check-ins)`);

		return scanLogs;
	} catch (error: any) {
		console.error("❌ Error fetching scan logs:", error);
		// Return empty array on error to prevent UI breakage
		return [];
	}
}
