import { format, isSameDay, isValid, parse, parseISO } from "date-fns";

/**
 * The API formats availability dates with Ruby's `%-d %B %Y` — a NON zero-padded
 * day ("5 August 2026"). Comparing those strings against `format(day, "dd MMMM yyyy")`
 * silently fails for every single-digit day, which is why calendars built that
 * way showed no selectable dates. Always go through these helpers instead of
 * hand-rolling the format at each call site.
 */
export const AVAILABILITY_DATE_FORMAT = "d MMMM yyyy";

/** Format a Date the way the availability/slots endpoints expect it. */
export function formatAvailabilityDate(date: Date): string {
	return format(date, AVAILABILITY_DATE_FORMAT);
}

/**
 * Parse an availability date string back into a Date. Falls back to ISO so a
 * "2026-08-05"-shaped value from an older payload still resolves.
 */
export function parseAvailabilityDate(value: string): Date | null {
	const parsed = parse(value, AVAILABILITY_DATE_FORMAT, new Date());
	if (isValid(parsed)) return parsed;

	const iso = parseISO(value);
	return isValid(iso) ? iso : null;
}

/**
 * Whether `day` is one of the API's available dates. Compares by calendar day
 * rather than by string, so padding/format differences can't hide a date.
 */
export function isAvailableDate(
	day: Date,
	dates: { date: string }[] | undefined,
): boolean {
	if (!dates?.length) return false;

	return dates.some((item) => {
		const parsed = parseAvailabilityDate(item.date);
		return parsed !== null && isSameDay(day, parsed);
	});
}

/**
 * Parse a booking's `booking_date` ("31 October 2026") and `booking_time`
 * ("02:20 PM") into one Date, for ordering bookings by when they happen. The
 * API returns bookings unordered (roughly creation order), so callers must
 * sort with this rather than trust the response order.
 */
export function parseBookingDateTime(
	bookingDate: string,
	bookingTime: string,
): Date | null {
	const day = parseAvailabilityDate(bookingDate);
	if (!day) return null;

	const withTime = parse(bookingTime.trim(), "hh:mm a", day);
	return isValid(withTime) ? withTime : day;
}

/**
 * Comparator: earliest booking first. Bookings whose date can't be parsed go
 * last so they never scramble the parsed ones.
 */
export function compareBookingsByTime(
	a: { booking_date: string; booking_time: string },
	b: { booking_date: string; booking_time: string },
): number {
	const timeA = parseBookingDateTime(a.booking_date, a.booking_time)?.getTime();
	const timeB = parseBookingDateTime(b.booking_date, b.booking_time)?.getTime();
	if (timeA === undefined && timeB === undefined) return 0;
	if (timeA === undefined) return 1;
	if (timeB === undefined) return -1;
	return timeA - timeB;
}
