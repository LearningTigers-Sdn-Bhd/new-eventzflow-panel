import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { renderToBuffer } from "@react-pdf/renderer";
import { FeedbackReport } from "@/components/pdf-reports/feedback-report";
import type {
	FeedbackAiSummary,
	FeedbackExportData,
} from "@/lib/api/feedback-form";

// Real export payload saved from the dev API (see scratch step); skipped when absent.
const SAMPLE = "/tmp/exp.json";

describe("feedback PDF", () => {
	test.skipIf(!existsSync(SAMPLE))(
		"renders a real export without errors",
		async () => {
			const data = JSON.parse(readFileSync(SAMPLE, "utf8"))
				.data as FeedbackExportData;
			for (const includeAttendee of [false, true]) {
				const buffer = await renderToBuffer(
					<FeedbackReport data={data} options={{ includeAttendee }} />,
				);
				expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
				expect(buffer.length).toBeGreaterThan(5000);
				if (!includeAttendee)
					writeFileSync("/tmp/feedback-report-sample.pdf", buffer);
			}
		},
	);

	test("renders with an AI summary and non-Latin text without errors", async () => {
		const data: FeedbackExportData = {
			generated_at: "2026-09-30T04:00:00Z",
			filters: {},
			event: { title: "Expo 他 😊", start_date: null, end_date: null },
			form: { title: "Feedback", display_mode: "pages" },
			summary: {
				total_responses: 1,
				last_submitted_at: null,
				response_rate: { eligible: 0, responded: 0, percent: null },
				overall_average: null,
				overall_satisfied_percent: null,
				timeline: [],
				questions: [
					{
						id: 1,
						question_text: "Comments",
						question_type: "text",
						required: false,
						answered_count: 1,
					},
				],
			},
			questions: [],
			responses: [],
			comments: [
				{
					question_id: 1,
					question_text: "Comments",
					answer_text: "とても良い 😊",
					submitted_at: "2026-03-26T10:30:00Z",
					attendee_name: "Aisyah",
					attendee_email: null,
				},
			],
		};
		const ai: FeedbackAiSummary = {
			id: 1,
			status: "ready",
			error: null,
			model: "M",
			filters: {},
			responses_count: 1,
			comments_count: 1,
			generated_by: null,
			created_at: "2026-09-30T05:00:00Z",
			finished_at: null,
			stale: false,
			content: {
				overall_sentiment: "positive",
				overview: "Good.",
				themes: [
					{
						name: "Talks",
						description: "d",
						sentiment: "positive",
						comment_count: 1,
						quotes: ["とても良い"],
					},
				],
				strengths: ["a"],
				problems: [],
				suggested_actions: [],
			},
		};
		const buffer = await renderToBuffer(
			<FeedbackReport
				data={data}
				options={{ includeAttendee: false }}
				aiSummary={ai}
			/>,
		);
		expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
	});
});
