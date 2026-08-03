import { publicRestClient, restClient } from "@/utils/rest-api";

export interface BusinessMatchingEvent {
	id: string;
	event_id: string;
	title: string;
	duration: string;
	location: string;
	admin_email: string;
	admin_wa_number: string;
	offering_tags?: string[];
	interest_tags?: string[];
	created_at?: string;
	updated_at?: string;
	bookings_count?: number;
	host: {
		id: string;
		full_name: string;
		email: string;
		phone?: string;
		offering_tags?: string[];
		interest_tags?: string[];
		description?: string;
		sourcing_intent?: string;
		capabilities?: string;
	} | null;
}

export interface BusinessHost {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	business_matching_event_id?: string;
	description?: string;
	sourcing_intent?: string;
	capabilities?: string;
	interest_tags?: string[];
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
	note?: string;
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

export interface PublicBookingInfo {
	id: string;
	name: string;
	email: string;
	booking_date: string;
	booking_time: string;
	status: string;
	event_id: string;
	bm_event_id: string;
	session_title: string;
	host_user_id: string;
	slot_duration: number;
}

/**
 * Fetch public booking info for reschedule (no auth required)
 */
export async function getPublicBookingInfo(bookingId: string): Promise<PublicBookingInfo> {
	return publicRestClient.get<PublicBookingInfo>(
		`v1/business_matching/bookings/${bookingId}/public`,
	);
}

/**
 * Reschedule a booking to a new date and time (no auth required)
 */
export async function rescheduleBooking(
	bookingId: string,
	date: string,
	time: string,
): Promise<{ message: string; booking_date: string; booking_time: string }> {
	return publicRestClient.patch(
		`v1/business_matching/bookings/${bookingId}/reschedule`,
		{ date, time },
	);
}

/**
 * Cancel a booking (no auth required)
 */
export async function cancelBooking(
	bookingId: string,
): Promise<{ message: string; status: string }> {
	return publicRestClient.patch(
		`v1/business_matching/bookings/${bookingId}/cancel`,
	);
}


export interface CreateSessionRequest {
	title: string;
	slot_duration: number;
	location?: string;
	admin_email?: string;
	admin_wa_number?: string;
	start_time?: string;
	end_time?: string;
}

export async function createBusinessMatchingSession(
	eventId: string,
	data: CreateSessionRequest,
): Promise<BusinessMatchingEvent> {
	return restClient.post<BusinessMatchingEvent>(
		`v1/business_matching/sessions?event_id=${eventId}`,
		{ session: data },
	);
}

export async function updateBusinessMatchingSession(
	sessionId: string,
	data: Partial<CreateSessionRequest>,
): Promise<BusinessMatchingEvent> {
	return restClient.put<BusinessMatchingEvent>(
		`v1/business_matching/sessions/${sessionId}`,
		{ session: data },
	);
}

export async function deleteBusinessMatchingSession(
	sessionId: string,
): Promise<void> {
	return restClient.delete<void>(`v1/business_matching/sessions/${sessionId}`);
}

export interface PortalParticipant {
	id: string;
	name: string;
	company: string;
	role: string;
	offering_tags: string[];
	interest_tags: string[];
}

export interface PortalBooking {
	id: string;
	date: string;
	time: string;
	status: string;
	requester: PortalParticipant;
	receiver: PortalParticipant;
}

export interface PortalData {
	participant: PortalParticipant;
	offering_tags: string[];
	interest_tags: string[];
	bookings: PortalBooking[];
}

export interface PortalMatch {
	participant: PortalParticipant;
	match_score: number;
}

export async function getPortalData(token: string): Promise<PortalData> {
	return publicRestClient.get<PortalData>(
		`v1/business_matching/portal?token=${token}`,
	);
}

export async function updatePortalProfile(
	token: string,
	offeringTags: string[],
	interestTags: string[],
): Promise<void> {
	return publicRestClient.put<void>(
		`v1/business_matching/portal?token=${token}`,
		{
			offering_tags: offeringTags,
			interest_tags: interestTags,
		},
	);
}

export async function getPortalMatches(token: string): Promise<PortalMatch[]> {
	return publicRestClient.get<PortalMatch[]>(
		`v1/business_matching/portal/matches?token=${token}`,
	);
}

export async function requestPortalBooking(
	token: string,
	receiverParticipantId: string,
	date: string,
	time: string,
): Promise<PortalBooking> {
	return publicRestClient.post<PortalBooking>(
		`v1/business_matching/portal/bookings?token=${token}`,
		{
			receiver_participant_id: receiverParticipantId,
			date,
			time,
		},
	);
}

export async function respondPortalBooking(
	token: string,
	bookingId: string,
	response: "accept" | "decline",
): Promise<PortalBooking> {
	return publicRestClient.put<PortalBooking>(
		`v1/business_matching/portal/bookings/${bookingId}/respond?token=${token}`,
		{
			response,
		},
	);
}

export interface BusinessMatchingAvailabilityRecord {
	id?: string;
	day: string;
	start_time: string;
	end_time: string;
	host_user_id?: string;
}

export async function getSessionAvailabilities(
	sessionId: string,
): Promise<BusinessMatchingAvailabilityRecord[]> {
	return restClient.get<BusinessMatchingAvailabilityRecord[]>(
		`v1/business_matching/sessions/${sessionId}/availabilities`,
	);
}

export async function updateSessionAvailabilities(
	sessionId: string,
	availabilities: { day: string; start_time: string; end_time: string }[],
	hostUserId?: string,
): Promise<void> {
	const url = hostUserId
		? `v1/business_matching/sessions/${sessionId}/availabilities?host_user_id=${hostUserId}`
		: `v1/business_matching/sessions/${sessionId}/availabilities`;
	return restClient.post<void>(url, { availabilities });
}

export interface HostProfile {
	offering_tags: string[];
	interest_tags: string[];
	description: string;
	sourcing_intent: string;
	capabilities: string;
}

export async function getHostProfile(eventId: string): Promise<HostProfile> {
	const url = `v1/business_matching/events/${eventId}/host_profile`;
	return restClient.get<HostProfile>(url);
}

export async function updateHostProfile(
	eventId: string,
	data: Partial<HostProfile>,
): Promise<HostProfile> {
	const url = `v1/business_matching/events/${eventId}/host_profile`;
	return restClient.put<HostProfile>(url, data);
}
