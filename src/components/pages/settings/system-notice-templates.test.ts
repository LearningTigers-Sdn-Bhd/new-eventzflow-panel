import { describe, expect, test } from "bun:test";
import {
	CUSTOM_TEMPLATE_ID,
	DEFAULT_TEMPLATE_VALUES,
	durationPhrase,
	fillTemplate,
	formatDuration,
	formatTime,
	hasPlaceholder,
	matchTemplateId,
	NO_WORST_CASE,
	nextWorst,
	SYSTEM_NOTICE_TEMPLATES,
	templateNeedsTime,
} from "./system-notice-templates";

describe("matchTemplateId", () => {
	test("returns the template id when the text matches exactly", () => {
		const template = SYSTEM_NOTICE_TEMPLATES[0];

		expect(matchTemplateId(`  ${template.text}  `)).toBe(template.id);
	});

	test("returns custom once the text is edited or empty", () => {
		expect(matchTemplateId(`${SYSTEM_NOTICE_TEMPLATES[0].text} Thanks!`)).toBe(
			CUSTOM_TEMPLATE_ID,
		);
		expect(matchTemplateId("")).toBe(CUSTOM_TEMPLATE_ID);
	});
});

describe("formatTime", () => {
	test("formats 24h input as 12h with AM/PM", () => {
		expect(formatTime("22:00")).toBe("10:00 PM");
		expect(formatTime("09:30")).toBe("9:30 AM");
	});

	test("handles midnight and noon", () => {
		expect(formatTime("00:05")).toBe("12:05 AM");
		expect(formatTime("12:00")).toBe("12:00 PM");
	});

	test("returns empty for an unfilled or invalid value", () => {
		expect(formatTime("")).toBe("");
		expect(formatTime("abc")).toBe("");
	});
});

describe("formatDuration", () => {
	test("uses minutes under an hour", () => {
		expect(formatDuration(10)).toBe("10 minutes");
		expect(formatDuration(45)).toBe("45 minutes");
	});

	test("uses hours from 60 minutes", () => {
		expect(formatDuration(60)).toBe("1 hour");
		expect(formatDuration(120)).toBe("2 hours");
		expect(formatDuration(90)).toBe("1 hour 30 minutes");
	});
});

describe("durationPhrase", () => {
	test("states the expected time and the worst case", () => {
		expect(durationPhrase(10, 30)).toBe(
			"about 10 minutes (up to 30 minutes in the worst case)",
		);
	});

	test("omits the worst case when none is stated", () => {
		expect(durationPhrase(10, NO_WORST_CASE)).toBe("about 10 minutes");
	});

	test("omits a worst case that is not longer than the expected time", () => {
		expect(durationPhrase(30, 30)).toBe("about 30 minutes");
	});
});

describe("nextWorst", () => {
	test("keeps a worst case that is still longer than the expected time", () => {
		expect(nextWorst(10, 30)).toBe(30);
	});

	test("keeps 'not stated'", () => {
		expect(nextWorst(60, NO_WORST_CASE)).toBe(NO_WORST_CASE);
	});

	test("moves it to the next option when the expected time catches up", () => {
		expect(nextWorst(30, 30)).toBe(45);
		expect(nextWorst(45, 30)).toBe(60);
	});

	test("drops it when no longer option exists", () => {
		expect(nextWorst(180, 120)).toBe(NO_WORST_CASE);
	});
});

describe("fillTemplate", () => {
	const scheduled = SYSTEM_NOTICE_TEMPLATES.find((t) => t.id === "scheduled");

	test("fills time and duration", () => {
		expect(
			fillTemplate(scheduled?.text ?? "", {
				time: "22:00",
				expected: 10,
				worst: 30,
			}),
		).toBe(
			"Scheduled system update at 10:00 PM. It takes about 10 minutes (up to 30 minutes in the worst case) and you may be briefly disconnected.",
		);
	});

	test("keeps [time] until a time is chosen", () => {
		const text = fillTemplate(scheduled?.text ?? "", DEFAULT_TEMPLATE_VALUES);

		expect(text).toContain("[time]");
		expect(hasPlaceholder(text)).toBe(true);
	});
});

describe("templates", () => {
	test("only scheduled and downtime need a time", () => {
		expect(
			SYSTEM_NOTICE_TEMPLATES.filter(templateNeedsTime).map((t) => t.id),
		).toEqual(["scheduled", "downtime"]);
	});

	test("every template states a duration", () => {
		for (const template of SYSTEM_NOTICE_TEMPLATES) {
			expect(template.text).toContain("[duration]");
		}
	});

	test("filled templates have no placeholder left and fit the 300 limit", () => {
		for (const template of SYSTEM_NOTICE_TEMPLATES) {
			const text = fillTemplate(template.text, {
				time: "22:00",
				expected: 180,
				worst: NO_WORST_CASE,
			});
			const longest = fillTemplate(template.text, {
				time: "22:00",
				expected: 120,
				worst: 180,
			});

			expect(hasPlaceholder(text)).toBe(false);
			expect(longest.length).toBeLessThanOrEqual(300);
		}
	});
});

describe("hasPlaceholder", () => {
	test("flags unreplaced [placeholders]", () => {
		expect(hasPlaceholder("Update at [time].")).toBe(true);
	});

	test("accepts a finished message", () => {
		expect(hasPlaceholder("Update at 10:00 PM.")).toBe(false);
	});
});
