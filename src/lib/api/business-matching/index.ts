import { restClient } from "@/utils/rest-api";

export interface BusinessMatchingEvent {
	id: string;
	event_id: string; // Changed from internal_event_id
	title: string;
	duration: string;
	location: string;
	admin_email: string;
	admin_wa_number: string;
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
export async function getBusinessMatchingEvents(eventId: string, force = false): Promise<BusinessMatchingEvent[]> {
	const url = force 
		? `v1/events/${eventId}/business_matching_events?force_refresh=true`
		: `v1/events/${eventId}/business_matching_events`;
		
	const response = await restClient.get<BusinessMatchingEvent[]>(url); // Get the raw response

    // Augment each event object with the eventId that was passed to this function
    return response.map(event => ({
        ...event,
        event_id: eventId // Ensure event_id is always present
    }));
}

/**
 * Fetch availability for a specific business matching event
 */
export async function getAvailability(bmEventId: string, eventId: string, force = false): Promise<AvailabilityResponse> {
    const url = force
        ? `v1/business_matching/events/${bmEventId}/availability?event_id=${eventId}&force_refresh=true`
        : `v1/business_matching/events/${bmEventId}/availability?event_id=${eventId}`;
    return restClient.get<AvailabilityResponse>(url);
}

/**
 * Fetch detailed slots for a specific date and business matching event
 */
export async function getDetailedSlots(bmEventId: string, date: string, eventId: string, force = false): Promise<DetailedSlotsResponse> {
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
    potential_deal_value?: string; // Maps to 'detail5'
    attendance?: string; // Maps to 'detail1'
}

export interface BookingsResponse {
    bookings: Booking[];
}

/**
 * Fetch bookings for a specific business matching event
 */
export async function getBookings(bmEventId: string, eventId: string, force = false): Promise<BookingsResponse> {
    const url = force
        ? `v1/business_matching/events/${bmEventId}/bookings?event_id=${eventId}&force_refresh=true`
        : `v1/business_matching/events/${bmEventId}/bookings?event_id=${eventId}`;
    return restClient.get<BookingsResponse>(url);
}

/**
 * Fetch a single booking from the backend
 */
export async function getSingleBooking(bmEventId: string, eventId: string, bookingId: string): Promise<Booking> {
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

export async function createBooking(bmEventId: string, eventId: string, data: CreateBookingRequest): Promise<void> {
    return restClient.post(`v1/business_matching/events/${bmEventId}/bookings?event_id=${eventId}`, { booking: data });
}

export interface UpdateBookingRequest {
    host_comment?: string;
    potential_deal_value?: string;
    attendance?: string;
    name?: string;
    email?: string;
    phone?: string;
    booking_date?: string;
    booking_time?: string;
    status?: string;
    payment_status?: string;
}

export async function updateBooking(bmEventId: string, eventId: string, bookingId: string, data: UpdateBookingRequest): Promise<void> {
    const url = `v1/business_matching/events/${bmEventId}/bookings/${bookingId}?event_id=${eventId}`;
    return restClient.put<void>(url, { booking: data }); // Wrap data in 'booking' key
}
