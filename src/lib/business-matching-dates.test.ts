import { describe, expect, test } from "bun:test";
import {
	compareBookingsByTime,
	formatAvailabilityDate,
	isAvailableDate,
	parseAvailabilityDate,
	parseBookingDateTime,
} from "./business-matching-dates";

describe("business matching availability dates", () => {
	test("formats without padding the day, matching the API's %-d %B %Y", () => {
		expect(formatAvailabilityDate(new Date(2026, 7, 5))).toBe("5 August 2026");
		expect(formatAvailabilityDate(new Date(2026, 7, 15))).toBe(
			"15 August 2026",
		);
	});

	test("parses the API format back to the same calendar day", () => {
		const parsed = parseAvailabilityDate("5 August 2026");
		expect(parsed?.getFullYear()).toBe(2026);
		expect(parsed?.getMonth()).toBe(7);
		expect(parsed?.getDate()).toBe(5);
	});

	test("falls back to ISO input", () => {
		expect(parseAvailabilityDate("2026-08-05")?.getDate()).toBe(5);
	});

	test("returns null for junk rather than an Invalid Date", () => {
		expect(parseAvailabilityDate("not a date")).toBeNull();
	});

	// The regression: a zero-padded string comparison ("05 August 2026" vs the
	// API's "5 August 2026") disabled every single-digit day in the calendar.
	test("matches single-digit days the old string comparison missed", () => {
		const dates = [{ date: "5 August 2026" }, { date: "15 August 2026" }];

		expect(isAvailableDate(new Date(2026, 7, 5), dates)).toBe(true);
		expect(isAvailableDate(new Date(2026, 7, 15), dates)).toBe(true);
		expect(isAvailableDate(new Date(2026, 7, 6), dates)).toBe(false);
	});

	test("is false when there are no dates at all", () => {
		expect(isAvailableDate(new Date(2026, 7, 5), undefined)).toBe(false);
		expect(isAvailableDate(new Date(2026, 7, 5), [])).toBe(false);
	});
});

describe("booking date-times", () => {
	test("combines the API's date and 12-hour time into one moment", () => {
		const parsed = parseBookingDateTime("3 November 2026", "02:20 PM");
		expect(parsed?.getFullYear()).toBe(2026);
		expect(parsed?.getMonth()).toBe(10);
		expect(parsed?.getDate()).toBe(3);
		expect(parsed?.getHours()).toBe(14);
		expect(parsed?.getMinutes()).toBe(20);
	});

	test("returns null for an unparseable date", () => {
		expect(parseBookingDateTime("not a date", "10:00 AM")).toBeNull();
	});

	test("sorts by date then time of day, not by text or arrival order", () => {
		const bookings = [
			{ booking_date: "31 October 2026", booking_time: "03:40 PM" },
			{ booking_date: "31 October 2026", booking_time: "11:00 AM" },
			{ booking_date: "1 November 2026", booking_time: "09:00 AM" },
			{ booking_date: "31 October 2026", booking_time: "12:00 PM" },
			{ booking_date: "31 October 2026", booking_time: "02:20 PM" },
		];
		expect(
			[...bookings]
				.sort(compareBookingsByTime)
				.map((b) => `${b.booking_date} ${b.booking_time}`),
		).toEqual([
			"31 October 2026 11:00 AM",
			"31 October 2026 12:00 PM",
			"31 October 2026 02:20 PM",
			"31 October 2026 03:40 PM",
			"1 November 2026 09:00 AM",
		]);
	});

	test("puts unparseable bookings last", () => {
		const bookings = [
			{ booking_date: "garbage", booking_time: "10:00 AM" },
			{ booking_date: "31 October 2026", booking_time: "11:00 AM" },
		];
		expect([...bookings].sort(compareBookingsByTime)[0].booking_date).toBe(
			"31 October 2026",
		);
	});
});
