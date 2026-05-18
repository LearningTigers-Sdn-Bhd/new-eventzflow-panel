import { publicRestClient, restClient } from "@/utils/rest-api";

export interface BusinessMatchingEvent {
	id: string;
	event_id: string;
	title: string;
	duration: string;
	location: string;
	admin_email: string;
	admin_wa_number: string;
	host: {
		id: string;
		full_name: string;
		email: string;
		phone?: string;
	} | null;
}

export interface BusinessHost {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	business_matching_event_id?: string;
	// Add other relevant host details here, e.g., profile_picture_url, bio
}

export interface AvailabilityDate {
	day: string;
	date: string;
	slots: number;
}

export interface AvailabilityResponse {
	dates: AvailabilityDate[];
}

export interface DetailedSlot {
	slot: string; // Changed from time
	day: string;
	date: string;
	// Removed available: boolean as it's not in the response
	// Add other properties if available from backend
}

export interface DetailedSlotsResponse {
	slots: DetailedSlot[];
}

/**
 * Fetch business matching events from the backend
 */
export async function getBusinessMatchingEvents(
	eventId: string,
	force = false,
): Promise<BusinessMatchingEvent[]> {
	const url = force
		? `v1/events/${eventId}/business_matching_events?force_refresh=true`
		: `v1/events/${eventId}/business_matching_events`;

	const response = await restClient.get<BusinessMatchingEvent[]>(url); // Get the raw response

	// Augment each event object with the eventId that was passed to this function
	return response.map((event) => ({
		...event,
		event_id: eventId, // Ensure event_id is always present
	}));
}

/**
 * Fetch business matching events for public booking (no auth)
 */
export async function getPublicBusinessMatchingEvents(
	eventId: string,
): Promise<BusinessMatchingEvent[]> {
	const url = `v1/public/events/${eventId}/business_matching_events`;
	const response = await publicRestClient.get<BusinessMatchingEvent[]>(url);

	return response.map((event) => ({
		...event,
		event_id: eventId,
	}));
}

/**
 * Fetch a list of business hosts for a specific event
 */
export async function getBusinessHosts(
	eventId: string,
): Promise<BusinessHost[]> {
	const url = `v1/business_matching/events/${eventId}/hosts`;
	return restClient.get<BusinessHost[]>(url);
}

/**
 * Fetch availability for a specific business matching event
 */
export async function getAvailability(
	bmEventId: string,
	eventId: string,
	force = false,
): Promise<AvailabilityResponse> {
	const url = force
		? `v1/business_matching/events/${bmEventId}/availability?event_id=${eventId}&force_refresh=true`
		: `v1/business_matching/events/${bmEventId}/availability?event_id=${eventId}`;
	return restClient.get<AvailabilityResponse>(url);
}

/**
 * Fetch host-specific availability for a specific event and host
 */
export async function getHostAvailability(
	eventId: string,
	hostUserId: string,
	force = false,
): Promise<AvailabilityResponse> {
	const url = force
		? `v1/business_matching/events/${eventId}/hosts/${hostUserId}/availability?force_refresh=true`
		: `v1/business_matching/events/${eventId}/hosts/${hostUserId}/availability`;
	return restClient.get<AvailabilityResponse>(url);
}

/**
 * Fetch detailed slots for a specific date and business matching event
 */
export async function getDetailedSlots(
	bmEventId: string,
	date: string,
	eventId: string,
	force = false,
): Promise<DetailedSlotsResponse> {
	const url = force
		? `v1/business_matching/events/${bmEventId}/availability/${date}/slots?event_id=${eventId}&force_refresh=true`
		: `v1/business_matching/events/${bmEventId}/availability/${date}/slots?event_id=${eventId}`;
	return restClient.get<DetailedSlotsResponse>(url);
}

export interface Booking {
	id: string;
	name: string;
	email: string;
	phone: string;
	booking_date: string;
	booking_time: string;
	duration: string;
	status: string;
	event_title: string;
	location: string;
	cancel_link: string;
	reschedule_link: string;
	meeting_approval_link: string;
	payment_status: string;
	created_at: string;
	host_comment?: string; // Maps to 'note'
	potential_deal_value?: number; // Maps to 'detail5'
	attendance?: string; // Maps to 'detail1'
}

export interface BookingsResponse {
	bookings: Booking[];
}

/**
 * Fetch bookings for a specific business matching event
 */
export async function getBookings(
	bmEventId: string,
	eventId: string,
	force = false,
): Promise<BookingsResponse> {
	const url = force
		? `v1/business_matching/events/${bmEventId}/bookings?event_id=${eventId}&force_refresh=true`
		: `v1/business_matching/events/${bmEventId}/bookings?event_id=${eventId}`;
	return restClient.get<BookingsResponse>(url);
}

/**
 * Fetch a single booking from the backend
 */
export async function getSingleBooking(
	bmEventId: string,
	eventId: string,
	bookingId: string,
): Promise<Booking> {
	const url = `v1/business_matching/events/${bmEventId}/bookings/${bookingId}?event_id=${eventId}`;
	return restClient.get<Booking>(url);
}

export interface CreateBookingRequest {
	name: string;
	email?: string;
	phone?: string;
	note?: string;
	date: string;
	time: string;
}

export async function createBooking(
	bmEventId: string,
	eventId: string,
	data: CreateBookingRequest,
): Promise<void> {
	return restClient.post(
		`v1/business_matching/events/${bmEventId}/bookings?event_id=${eventId}`,
		{ booking: data },
	);
}

export interface UpdateBookingRequest {
	host_comment?: string;
	potential_deal_value?: number; // Changed from string to number
	attendance?: string;
	name?: string;
	email?: string;
	phone?: string;
	booking_date?: string;
	booking_time?: string;
	status?: string;
	payment_status?: string;
}

export async function updateBooking(
	bmEventId: string,
	eventId: string,
	bookingId: string,
	data: UpdateBookingRequest,
): Promise<void> {
	const url = `v1/business_matching/events/${bmEventId}/bookings/${bookingId}?event_id=${eventId}`;
	return restClient.put<void>(url, { booking: data }); // Wrap data in 'booking' key
}

export interface PublicCreateBookingRequest {
	name: string;
	email: string;
	phone: string;
	date: string;
	time: string;
}

export async function createPublicBooking(
	bmEventId: string, // This is required by the backend, even if it's the same as eventId sometimes
	eventId: string,
	hostUserId: string,
	data: PublicCreateBookingRequest,
): Promise<Booking> {
	// Changed return type to Promise<Booking>
	const url = `v1/business_matching/events/${eventId}/bookings/public?host_user_id=${hostUserId}&business_matching_event_id=${bmEventId}`;
	return restClient.post<Booking>(url, { booking: data });
}

/**
 * Download business matching report
 */
export async function downloadBookingsReport(
	eventId: string,
	format: "pdf" | "xlsx",
	bmEventIds?: string[], // Add optional array of bm_event_ids
): Promise<void> {
	const url = `v1/business_matching/events/${eventId}/report?format=${format}`;

	// Use POST to send a list of IDs
	const { blob } = await restClient.postBlob(url, {
		business_matching_event_ids: bmEventIds,
	});

	// Create download link
	const downloadUrl = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = downloadUrl;
	link.download = `business_matching_report_${eventId}.${format}`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Join as a business host for a specific event
 */
export async function joinBusinessHost(
	eventId: string,
	bmEventId: string,
): Promise<void> {
	const url = `v1/business_matching/events/${eventId}/hosts/join`;
	return restClient.post<void>(url, { business_matching_event_id: bmEventId });
}

export interface CreateHostRequest {
	full_name: string;
	email: string;
	phone?: string;
	password?: string;
}

/**
 * Create a new user, assign as business_host, and attach to a specific BM event.
 */
export async function createAndAssignHost(
	eventId: string,
	bmEventId: string,
	data: CreateHostRequest,
): Promise<BusinessHost> {
	const url = `v1/business_matching/events/${eventId}/hosts/create_and_assign`;
	return restClient.post<BusinessHost>(url, {
		host: data,
		business_matching_event_id: bmEventId,
	});
}

/**
 * Remove a host from a specific BM event.
 */
export async function removeHost(
	eventId: string,
	bmEventId: string,
): Promise<void> {
	const url = `v1/business_matching/events/${eventId}/hosts/remove?business_matching_event_id=${bmEventId}`;
	return restClient.delete<void>(url);
}

/**
 * Fetch a single booking from the backend (public endpoint)
 */
export async function getPublicBookingById(
	bookingId: string,
	bmEventId: string,
	eventId: string,
): Promise<Booking> {
	const url = `v1/public/bookings/${bookingId}?bm_event_id=${bmEventId}&event_id=${eventId}`;
	return publicRestClient.get<Booking>(url);
}
