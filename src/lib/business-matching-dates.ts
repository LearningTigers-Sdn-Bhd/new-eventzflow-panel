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
