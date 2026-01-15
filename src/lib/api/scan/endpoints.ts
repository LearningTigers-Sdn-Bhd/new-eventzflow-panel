import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import type {
	BackendRecentCheckInsResponse,
	BackendScanCheckInResponse,
	RecentCheckIn,
	ScanCheckInResponse,
	ScanType,
} from "./response";
import { ScanCheckInError } from "./response";

/**
 * Unified check-in endpoint
 * Handles both ticket and visitor check-ins automatically
 *
 * @param publicId - The public_id (UUID) from the scanned QR code
 * @returns Normalized check-in response with type indicator
 */
export async function checkIn(publicId: string): Promise<ScanCheckInResponse> {
	const url = `v1/scan/${publicId}/check_in`;

	try {
		const response = await restClient.patch<BackendScanCheckInResponse>(url, {});

		// Normalize the response based on type
		const isTicket = response.type === "ticket";

		return {
			type: response.type,
			publicId: response.public_id,
			id: response.id.toString(),
			role: response.role,
			checkedIn: response.checked_in,
			checkInAt: response.check_in_at,
			// Normalize name field (tickets use attendee_name, visitors use full_name)
			name: isTicket
				? response.attendee_name || "Unknown Attendee"
				: response.full_name || "Unknown Visitor",
			// Normalize email/phone (tickets use attendee_*, visitors use direct fields)
			email: isTicket ? response.attendee_email : response.email,
			phone: isTicket ? response.attendee_phone : response.phone,
			// Event info
			eventId: response.event.id,
			eventName: response.event.title,
			// Scanned by
			scannedBy: response.scanned_by
				? {
						id: response.scanned_by.id,
						fullName: response.scanned_by.full_name,
					}
				: undefined,
			// Ticket-specific
			ticketType: response.ticket_type,
			// Visitor-specific
			gender: response.gender,
			age: response.age,
		};
	} catch (error) {
		// Try to extract type from error response (backend sends it for duplicate errors)
		let scanType: ScanType | null = null;
		if (error && typeof error === "object" && "response" in error) {
			const response = error.response as { data?: { type?: ScanType } };
			scanType = response?.data?.type ?? null;
		}
		const message = await extractErrorMessage(error);
		throw new ScanCheckInError(message, scanType);
	}
}

/**
 * Fetch recent check-ins for authorized events
 * Returns both tickets and visitors sorted by check-in time
 *
 * @param options - Optional filter parameters
 * @returns Array of recent check-ins
 */
export async function getRecentCheckIns(options?: {
	eventId?: number;
	limit?: number;
}): Promise<RecentCheckIn[]> {
	const params = new URLSearchParams();
	if (options?.eventId) {
		params.append("event_id", options.eventId.toString());
	}
	if (options?.limit) {
		params.append("limit", options.limit.toString());
	}

	const queryString = params.toString();
	const url = `v1/scan/recent_check_ins${queryString ? `?${queryString}` : ""}`;

	try {
		const response = await restClient.get<BackendRecentCheckInsResponse>(url);

		return response.check_ins.map((item) => ({
			type: item.type,
			scanId: item.scan_id,
			role: item.role,
			name: item.name,
			email: item.email,
			phone: item.phone,
			ticketType: item.ticket_type,
			ticketValue: item.ticket_value,
			gender: item.gender,
			age: item.age,
			eventId: item.event_id,
			eventName: item.event_name,
			checkedIn: item.checked_in,
			checkInAt: item.check_in_at,
			timestamp: new Date(item.check_in_at),
			status: item.status,
			scannedBy: item.scanned_by
				? {
						id: item.scanned_by.id,
						fullName: item.scanned_by.full_name,
					}
				: undefined,
		}));
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}
