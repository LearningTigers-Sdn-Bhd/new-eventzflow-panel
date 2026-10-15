import { describe, expect, test } from "bun:test";
import type {
	FeedbackAiSummary,
	FeedbackExportData,
} from "@/lib/api/feedback-form";
import { buildResponsesCsv, neutralizeFormula, toCsv } from "./csv";
import {
	aiSummaryRows,
	answerCell,
	commentTable,
	exportFilename,
	responseTable,
} from "./rows";
import { buildFeedbackWorkbook } from "./xlsx";

const data: FeedbackExportData = {
	generated_at: "2026-09-30T04:00:00Z",
	filters: {},
	event: {
		title: "Startup Expo 2026 — Day 1!",
		start_date: null,
		end_date: null,
	},
	form: { title: "Feedback", display_mode: "pages" },
	summary: {
		total_responses: 2,
		last_submitted_at: null,
		response_rate: { eligible: 4, responded: 2, percent: 50 },
		overall_average: 4,
		overall_satisfied_percent: 100,
		timeline: [],
		questions: [
			{
				id: 1,
				question_text: "Rate us",
				question_type: "rating",
				required: true,
				answered_count: 2,
				seen_count: 2,
				average: 4,
				satisfied_percent: 100,
			},
			{
				id: 4,
				question_text: "Comments",
				question_type: "text",
				required: false,
				answered_count: 1,
			},
		],
	},
	questions: [
		{
			id: 1,
			question_text: "Rate us",
			question_type: "rating",
			options: null,
			required: true,
			page_number: 1,
			position: 0,
			routing_rules: [],
		},
		{
			id: 2,
			question_text: "Liked",
			question_type: "multi_choice",
			options: ["Food", "Talks"],
			required: false,
			page_number: 1,
			position: 1,
			routing_rules: [],
		},
		{
			id: 3,
			question_text: "Again?",
			question_type: "yes_no",
			options: null,
			required: false,
			page_number: 2,
			position: 2,
			routing_rules: [],
		},
		{
			id: 4,
			question_text: "Comments",
			question_type: "text",
			options: null,
			required: false,
			page_number: 2,
			position: 3,
			routing_rules: [{ answer: "x", action: "submit", target_page: null }],
		},
	],
	responses: [
		{
			id: 1,
			submitted_at: "2026-03-26T10:30:00Z",
			ticket: {
				public_id: "abc-123",
				attendee_name: "Aisyah Tan",
				attendee_email: "aisyah@example.com",
				ticket_type_name: "VIP",
			},
			answers: {
				"1": "5",
				"2": ["Food", "Talks"],
				"3": "yes",
				"4": '=SUM(1+1), "wow"\nsecond line',
			},
		},
		{
			id: 2,
			submitted_at: "2026-03-26T11:00:00Z",
			ticket: {
				public_id: "def-456",
				attendee_name: "他の人 😊",
				attendee_email: null,
				ticket_type_name: "General",
			},
			answers: { "1": "3" },
		},
	],
	comments: [
		{
			question_id: 4,
			question_text: "Comments",
			answer_text: "+60 12-345 6789",
			submitted_at: "2026-03-26T10:30:00Z",
			attendee_name: "Aisyah Tan",
			attendee_email: "aisyah@example.com",
		},
	],
};

describe("export rows", () => {
	test("one column per question, in form order, blanks for skipped questions", () => {
		const { headers, rows } = responseTable(data, { includeAttendee: true });
		expect(headers.slice(-4)).toEqual([
			"Q1. Rate us",
			"Q2. Liked",
			"Q3. Again?",
			"Q4. Comments",
		]);
		expect(rows[1].slice(-4)).toEqual([3, "", "", ""]);
	});

	test("ratings are numbers, multi-choice joined, yes/no title-cased", () => {
		const q = data.questions;
		expect(answerCell(q[0], "5")).toBe(5);
		expect(answerCell(q[1], ["Food", "Talks"])).toBe("Food; Talks");
		expect(answerCell(q[2], "yes")).toBe("Yes");
		expect(answerCell(q[3], "   ")).toBe("");
		expect(answerCell(q[3], undefined)).toBe("");
	});

	test("hiding attendee details drops name, email and ticket id", () => {
		const { headers, rows } = responseTable(data, { includeAttendee: false });
		expect(headers).toEqual([
			"Submitted at",
			"Ticket type",
			"Q1. Rate us",
			"Q2. Liked",
			"Q3. Again?",
			"Q4. Comments",
		]);
		expect(rows.flat().join("|")).not.toContain("aisyah@example.com");
		expect(rows.flat().join("|")).not.toContain("abc-123");
		const comments = commentTable(data, { includeAttendee: false });
		expect(comments.headers).toEqual(["Submitted at", "Question", "Comment"]);
	});

	test("filename is safe and dated", () => {
		expect(exportFilename(data, "csv", new Date("2026-09-30T00:00:00Z"))).toBe(
			"feedback-startup-expo-2026-day-1-2026-09-30.csv",
		);
	});
});

describe("csv", () => {
	test("starts with a BOM so Excel reads UTF-8", () => {
		expect(
			buildResponsesCsv(data, { includeAttendee: true }).startsWith("﻿"),
		).toBe(true);
	});

	test("neutralizes formula-looking cells but leaves numbers and normal text", () => {
		expect(neutralizeFormula("=1+1")).toBe("'=1+1");
		expect(neutralizeFormula("+60123")).toBe("'+60123");
		expect(neutralizeFormula("-5 degrees")).toBe("'-5 degrees");
		expect(neutralizeFormula("@team")).toBe("'@team");
		expect(neutralizeFormula("\tsneaky")).toBe("'\tsneaky");
		expect(neutralizeFormula("Great event")).toBe("Great event");
		expect(neutralizeFormula(5)).toBe(5);
	});

	test("quotes commas, quotes and newlines; keeps unicode", () => {
		const csv = toCsv(
			["a", "b"],
			[
				["x, y", 'say "hi"\nthere'],
				["他の人 😊", 3],
			],
		);
		expect(csv).toBe('a,b\r\n"x, y","say ""hi""\nthere"\r\n他の人 😊,3');
	});

	test("a malicious answer is neutralized and still one well-formed cell", () => {
		const csv = buildResponsesCsv(data, { includeAttendee: true });
		expect(csv).toContain(`"'=SUM(1+1), ""wow""\nsecond line"`);
	});

	test("an empty result is just the header row", () => {
		const csv = buildResponsesCsv(
			{ ...data, responses: [] },
			{ includeAttendee: true },
		);
		expect(csv.split("\r\n")).toHaveLength(1);
	});
});

describe("excel", () => {
	test("has the four sheets with the right row counts", async () => {
		const XLSX = await import("xlsx-js-style");
		const bytes = await buildFeedbackWorkbook(data, { includeAttendee: true });
		const wb = XLSX.read(bytes, { type: "array" });
		expect(wb.SheetNames).toEqual([
			"Summary",
			"Responses",
			"Comments",
			"Questions",
		]);

		const responses = XLSX.utils.sheet_to_json<string[]>(wb.Sheets.Responses, {
			header: 1,
		});
		expect(responses).toHaveLength(3); // header + 2 responses
		expect(responses[1]).toContain("Aisyah Tan");

		const questions = XLSX.utils.sheet_to_json<string[]>(wb.Sheets.Questions, {
			header: 1,
		});
		expect(questions).toHaveLength(5);
		expect(questions[4].join("|")).toContain("x → submit");

		const summary = XLSX.utils
			.sheet_to_json<string[]>(wb.Sheets.Summary, { header: 1 })
			.flat()
			.join("|");
		expect(summary).toContain("50% (2 of 4 checked-in attendees)");
	});

	test("ratings stay numeric and formula-looking text stays text", async () => {
		const XLSX = await import("xlsx-js-style");
		const wb = XLSX.read(
			await buildFeedbackWorkbook(data, { includeAttendee: true }),
			{ type: "array" },
		);
		const sheet = wb.Sheets.Responses;
		const ratingCol = XLSX.utils
			.sheet_to_json<string[]>(sheet, { header: 1 })[0]
			.indexOf("Q1. Rate us");
		expect(sheet[XLSX.utils.encode_cell({ r: 1, c: ratingCol })].t).toBe("n");
		const commentCol = XLSX.utils
			.sheet_to_json<string[]>(sheet, { header: 1 })[0]
			.indexOf("Q4. Comments");
		const cell = sheet[XLSX.utils.encode_cell({ r: 1, c: commentCol })];
		expect(cell.t).toBe("s");
		expect(cell.f).toBeUndefined();
	});

	test("honours the attendee toggle", async () => {
		const XLSX = await import("xlsx-js-style");
		const wb = XLSX.read(
			await buildFeedbackWorkbook(data, { includeAttendee: false }),
			{ type: "array" },
		);
		const all = JSON.stringify(
			XLSX.utils.sheet_to_json(wb.Sheets.Responses, { header: 1 }),
		);
		expect(all).not.toContain("aisyah@example.com");
		expect(
			JSON.stringify(
				XLSX.utils.sheet_to_json(wb.Sheets.Comments, { header: 1 }),
			),
		).not.toContain("Aisyah");
	});
});

describe("pdf text", () => {
	test("replaces characters the built-in font cannot draw, keeps the rest", async () => {
		const { sanitizeForPdf, needsSanitizing } = await import(
			"@/components/pdf-reports/pdf-text"
		);
		expect(sanitizeForPdf("Great café – “wow” €5")).toBe(
			"Great café – “wow” €5",
		);
		expect(sanitizeForPdf("他の 😊 ok")).toBe("?? ? ok");
		expect(needsSanitizing("plain text")).toBe(false);
		expect(needsSanitizing("emoji 😊")).toBe(true);
	});
});

const aiSummary: FeedbackAiSummary = {
	id: 1,
	status: "ready",
	error: null,
	model: "Test Model",
	filters: {},
	responses_count: 2,
	comments_count: 2,
	generated_by: "Owner",
	created_at: "2026-09-30T05:00:00Z",
	finished_at: "2026-09-30T05:01:00Z",
	stale: false,
	content: {
		overall_sentiment: "mixed",
		overview: "Talks were loved; queues were long.",
		themes: [
			{
				name: "Queues",
				description: "Registration was slow",
				sentiment: "negative",
				comment_count: 1,
				quotes: ["queue was far too long"],
			},
		],
		strengths: ["Great speakers"],
		problems: ["Long queues"],
		suggested_actions: ["Add desks"],
	},
};

describe("AI summary in exports", () => {
	test("rows are labelled AI-generated and include every section", () => {
		const flat = aiSummaryRows(aiSummary).flat().join("|");
		expect(flat).toContain("AI-generated");
		expect(flat).toContain("Test Model");
		expect(flat).toContain("Queues");
		expect(flat).toContain("Great speakers");
		expect(flat).toContain("Add desks");
		expect(aiSummaryRows({ ...aiSummary, content: null })).toEqual([]);
	});

	test("the Excel file has an AI summary sheet only when one is passed", async () => {
		const XLSX = await import("xlsx-js-style");
		const without = XLSX.read(
			await buildFeedbackWorkbook(data, { includeAttendee: false }),
			{ type: "array" },
		);
		expect(without.SheetNames).not.toContain("AI summary");
		const withAi = XLSX.read(
			await buildFeedbackWorkbook(data, { includeAttendee: false }, aiSummary),
			{ type: "array" },
		);
		expect(withAi.SheetNames).toEqual([
			"Summary",
			"Responses",
			"Comments",
			"Questions",
			"AI summary",
		]);
		expect(
			JSON.stringify(
				XLSX.utils.sheet_to_json(withAi.Sheets["AI summary"], { header: 1 }),
			),
		).toContain("AI-generated");
	});
});
