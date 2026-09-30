import type {
	FeedbackAiSummary,
	FeedbackExportData,
	FeedbackExportQuestion,
	FeedbackSummaryQuestion,
} from "@/lib/api/feedback-form";

/** Cells are plain strings or numbers, so CSV and Excel are built from the same rows. */
export type Cell = string | number;

export interface ExportOptions {
	/** Name, email and ticket ID. Off for files shared outside the team. */
	includeAttendee: boolean;
}

export const DEFAULT_OPTIONS = {
	csv: { includeAttendee: true },
	xlsx: { includeAttendee: true },
	pdf: { includeAttendee: false },
} satisfies Record<string, ExportOptions>;

/** YYYY-MM-DD HH:mm in the viewer's timezone; sorts and parses cleanly in Excel. */
export function formatDateTime(value: string | null | undefined) {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function questionHeader(
	question: FeedbackExportQuestion,
	index: number,
) {
	return `Q${index + 1}. ${question.question_text}`;
}

/** One answer as a cell. Skipped or unanswered questions are blank. */
export function answerCell(
	question: FeedbackExportQuestion,
	value: string | string[] | null | undefined,
): Cell {
	if (value === null || value === undefined) return "";
	if (Array.isArray(value)) return value.join("; ");
	const text = value.trim();
	if (text === "") return "";
	if (question.question_type === "rating" && /^[1-5]$/.test(text)) {
		return Number(text);
	}
	if (question.question_type === "yes_no") {
		return text.toLowerCase() === "yes"
			? "Yes"
			: text.toLowerCase() === "no"
				? "No"
				: text;
	}
	return value;
}

/** Header row plus one row per response, one column per question. */
export function responseTable(
	data: FeedbackExportData,
	options: ExportOptions,
): { headers: string[]; rows: Cell[][] } {
	const headers = [
		"Submitted at",
		...(options.includeAttendee ? ["Attendee name", "Attendee email"] : []),
		"Ticket type",
		...(options.includeAttendee ? ["Ticket ID"] : []),
		...data.questions.map(questionHeader),
	];
	const rows = data.responses.map((response) => [
		formatDateTime(response.submitted_at),
		...(options.includeAttendee
			? [
					response.ticket?.attendee_name ?? "",
					response.ticket?.attendee_email ?? "",
				]
			: []),
		response.ticket?.ticket_type_name ?? "",
		...(options.includeAttendee ? [response.ticket?.public_id ?? ""] : []),
		...data.questions.map((question) =>
			answerCell(question, response.answers[String(question.id)]),
		),
	]);
	return { headers, rows };
}

export function commentTable(
	data: FeedbackExportData,
	options: ExportOptions,
): { headers: string[]; rows: Cell[][] } {
	const headers = [
		"Submitted at",
		...(options.includeAttendee ? ["Attendee name", "Attendee email"] : []),
		"Question",
		"Comment",
	];
	const rows = data.comments.map((comment) => [
		formatDateTime(comment.submitted_at),
		...(options.includeAttendee
			? [comment.attendee_name ?? "", comment.attendee_email ?? ""]
			: []),
		comment.question_text,
		comment.answer_text,
	]);
	return { headers, rows };
}

function ruleSummary(question: FeedbackExportQuestion) {
	return question.routing_rules
		.map((rule) =>
			rule.action === "submit" || rule.target_page == null
				? `${rule.answer} → submit`
				: `${rule.answer} → page ${rule.target_page}`,
		)
		.join("; ");
}

/** The form's structure, so a file is understandable without the app. */
export function questionTable(data: FeedbackExportData): {
	headers: string[];
	rows: Cell[][];
} {
	return {
		headers: [
			"#",
			"Question",
			"Type",
			"Page / section",
			"Required",
			"Options",
			"Routing",
		],
		rows: data.questions.map((question, index) => [
			index + 1,
			question.question_text,
			question.question_type.replace(/_/g, " "),
			question.page_number,
			question.required ? "Yes" : "No",
			(question.options ?? []).join("; "),
			ruleSummary(question),
		]),
	};
}

/** One line describing a question's result, for summaries. */
export function describeResult(question: FeedbackSummaryQuestion): string {
	if (question.question_type === "rating") {
		const parts = [`${(question.average ?? 0).toFixed(1)} / 5 average`];
		if (question.satisfied_percent != null) {
			parts.push(`${question.satisfied_percent}% satisfied`);
		}
		return parts.join(" · ");
	}
	if (question.question_type === "text") {
		return `${question.answered_count} written comments`;
	}
	return (question.options ?? [])
		.map((option) => `${option.label}: ${option.percent}% (${option.count})`)
		.join("\n");
}

export function filtersDescription(data: FeedbackExportData) {
	const parts: string[] = [];
	if (data.filters.ticket_type_id) parts.push("One ticket type");
	if (data.filters.from) parts.push(`from ${data.filters.from}`);
	if (data.filters.to) parts.push(`to ${data.filters.to}`);
	return parts.length > 0 ? parts.join(", ") : "No filters (all responses)";
}

export function responseRateText(data: FeedbackExportData) {
	const rate = data.summary.response_rate;
	if (!rate || rate.percent === null) return "—";
	return `${rate.percent}% (${rate.responded} of ${rate.eligible} checked-in attendees)`;
}

export function exportFilename(
	data: FeedbackExportData,
	extension: "csv" | "xlsx" | "pdf",
	now = new Date(),
) {
	const slug = data.event.title
		.normalize("NFKD")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase()
		.slice(0, 60);
	return `feedback-${slug || "event"}-${now.toISOString().slice(0, 10)}.${extension}`;
}

/** The AI summary as label/value rows, always marked as AI-generated. */
export function aiSummaryRows(summary: FeedbackAiSummary): Cell[][] {
	const content = summary.content;
	if (!content) return [];
	const rows: Cell[][] = [
		["AI summary (AI-generated: check it against the comments)"],
		[
			`Made ${formatDateTime(summary.finished_at ?? summary.created_at)}${summary.model ? ` by ${summary.model}` : ""} from ${summary.comments_count} comments${Object.values(summary.filters ?? {}).some(Boolean) ? " (filtered view)" : ""}`,
		],
		[],
		["Overall", content.overall_sentiment],
		["Overview", content.overview],
		[],
		["Theme", "Sentiment", "About (comments)", "Description", "Quotes"],
		...content.themes.map((theme) => [
			theme.name,
			theme.sentiment,
			theme.comment_count,
			theme.description,
			theme.quotes.map((quote) => `"${quote}"`).join("\n"),
		]),
	];
	const list = (title: string, items: string[]) =>
		items.length > 0 ? [[], [title], ...items.map((item) => [item])] : [];
	return [
		...rows,
		...list("What went well", content.strengths),
		...list("What to fix", content.problems),
		...list("Suggested next steps", content.suggested_actions),
	];
}
