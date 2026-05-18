import type { PublicEventInfo } from "@/lib/api/event/endpoints";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
	hour: "numeric",
	minute: "2-digit",
});

function formatDayMonth(date: Date) {
	const day = String(date.getDate()).padStart(2, "0");
	return `${day} ${MONTH_NAMES[date.getMonth()]}`;
}

function formatDayMonthYear(date: Date) {
	return `${formatDayMonth(date)}, ${date.getFullYear()}`;
}

function toDate(value?: string | null) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function formatOrdinal(day: number) {
	if (day >= 11 && day <= 13) return `${day}th`;
	const lastDigit = day % 10;
	if (lastDigit === 1) return `${day}st`;
	if (lastDigit === 2) return `${day}nd`;
	if (lastDigit === 3) return `${day}rd`;
	return `${day}th`;
}

export function formatEventDateRange(event: PublicEventInfo | null) {
	if (!event?.start_date) return null;
	const start = toDate(event.start_date);
	const end = toDate(event.end_date);
	if (!start) return null;
	if (!end || start.toDateString() === end.toDateString()) {
		return formatDayMonthYear(start);
	}

	const sameYear = start.getFullYear() === end.getFullYear();
	const sameMonth = sameYear && start.getMonth() === end.getMonth();
	if (sameYear) {
		if (sameMonth) {
			const startDay = String(start.getDate()).padStart(2, "0");
			return `${startDay} ${MONTH_NAMES[start.getMonth()]} - ${formatDayMonthYear(end)}`;
		}
		return `${formatDayMonth(start)} - ${formatDayMonthYear(end)}`;
	}

	return `${formatDayMonthYear(start)} - ${formatDayMonthYear(end)}`;
}

export function getUniqueLocations(sessions?: EventSeatSession[]) {
	if (!sessions?.length) return [];
	const locations = new Set<string>();
	for (const session of sessions) {
		if (session.location) {
			locations.add(session.location);
		}
	}
	return Array.from(locations);
}

export function getSessionDateDisplay(session: EventSeatSession) {
	const start = toDate(session.start_datetime);
	const end = toDate(session.end_datetime);
	if (!start) {
		return {
			dayRange: null,
			monthRange: null,
			isMultiDay: false,
		};
	}

	const sameDay = !end || start.toDateString() === end.toDateString();
	const startDay = formatOrdinal(start.getDate());
	const endDay = end ? formatOrdinal(end.getDate()) : startDay;
	const dayRange = sameDay ? startDay : `${startDay} - ${endDay}`;

	let monthRange = formatDayMonthYear(start);
	if (end && !sameDay) {
		const sameYear = start.getFullYear() === end.getFullYear();
		const sameMonth = sameYear && start.getMonth() === end.getMonth();
		if (sameMonth) {
			monthRange = formatDayMonthYear(start);
		} else if (sameYear) {
			monthRange = `${formatDayMonth(start)} - ${formatDayMonthYear(end)}`;
		} else {
			monthRange = `${formatDayMonthYear(start)} - ${formatDayMonthYear(end)}`;
		}
	}

	return {
		dayRange,
		monthRange,
		isMultiDay: !sameDay,
	};
}

export function getSessionTimeRange(session: EventSeatSession) {
	const start = toDate(session.start_datetime);
	const end = toDate(session.end_datetime);
	if (!start) return null;
	if (!end) return TIME_FORMATTER.format(start);
	return `${TIME_FORMATTER.format(start)} - ${TIME_FORMATTER.format(end)}`;
}

export function getSessionPrices(session: EventSeatSession) {
	const prices = new Set<string>();
	for (const venue of session.event_seat_venues ?? []) {
		for (const section of venue.event_seat_sections ?? []) {
			const priceValue = section.price;
			if (
				priceValue === null ||
				priceValue === undefined ||
				priceValue === ""
			) {
				continue;
			}
			const normalized =
				typeof priceValue === "string" ? priceValue.trim() : String(priceValue);
			if (!normalized) continue;
			const cleaned = normalized.replace(/,/g, "").replace(/^RM/i, "");
			const numeric = Number.parseFloat(cleaned);
			if (Number.isNaN(numeric)) continue;
			prices.add(`RM${numeric.toFixed(2)}`);
		}
	}
	return Array.from(prices);
}

export function getSessionIdentifier(session: EventSeatSession) {
	return session.slug || session.public_id || String(session.id);
}

export function getSeatAvailability(session: EventSeatSession) {
	const venues = session.event_seat_venues ?? [];
	let totalSeats = 0;
	let availableSeats = 0;

	for (const venue of venues) {
		for (const section of venue.event_seat_sections ?? []) {
			const counts = section.ticket_seat_counts ?? section.visitor_seat_counts;
			if (counts) {
				totalSeats += counts.total;
				availableSeats += counts.available;
				continue;
			}
			const seats = section.event_ticket_seats ?? [];
			totalSeats += seats.length;
			availableSeats += seats.filter((seat) => seat.ticket_id === null).length;
		}
	}

	if (totalSeats === 0) {
		return {
			label: null,
			isFull: false,
			isAlmostFull: false,
		};
	}

	if (availableSeats === 0) {
		return {
			label: "Full",
			isFull: true,
			isAlmostFull: false,
		};
	}

	const availabilityRatio = availableSeats / totalSeats;
	if (availabilityRatio <= 0.15) {
		return {
			label: "Almost Full",
			isFull: false,
			isAlmostFull: true,
		};
	}

	return {
		label: null,
		isFull: false,
		isAlmostFull: false,
	};
}
