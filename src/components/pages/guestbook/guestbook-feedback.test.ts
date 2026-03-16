import { describe, expect, test } from "bun:test";

import { getGuestbookSubmissionFeedback } from "./guestbook-feedback";

describe("getGuestbookSubmissionFeedback", () => {
	test("maps approved wishes to a success message", () => {
		expect(getGuestbookSubmissionFeedback("approved")).toEqual({
			accentClassName: "border-emerald-100 bg-emerald-50/50 text-emerald-800",
			body: "Your wish has been posted and may already be visible on the wishes wall.",
			title: "Wish posted",
		});
	});

	test("maps pending wishes to a review message", () => {
		expect(getGuestbookSubmissionFeedback("pending")).toEqual({
			accentClassName: "border-amber-100 bg-amber-50/60 text-amber-900",
			body: "Your wish was received and is waiting for review before it appears on the wishes wall.",
			title: "Waiting for review",
		});
	});

	test("maps rejected wishes to a retry message", () => {
		expect(getGuestbookSubmissionFeedback("rejected")).toEqual({
			accentClassName: "border-rose-100 bg-rose-50/60 text-rose-900",
			body: "Your wish could not be posted. Please revise the message and try again.",
			title: "Wish not posted",
		});
	});
});
