import type {
	FeedbackAiSummary,
	FeedbackExportData,
} from "@/lib/api/feedback-form";
import {
	aiSummaryRows,
	type Cell,
	commentTable,
	describeResult,
	type ExportOptions,
	filtersDescription,
	formatDateTime,
	questionTable,
	responseRateText,
	responseTable,
} from "./rows";

const HEADER_STYLE = {
	font: { bold: true },
	fill: { fgColor: { rgb: "E5E7EB" } },
	alignment: { vertical: "center", wrapText: true },
};
const WRAP = { alignment: { vertical: "top", wrapText: true } };

type Sheet = Record<string, unknown>;

/** Writes rows to a sheet with a styled header, widths and a filter. */
function tableSheet(
	XLSX: typeof import("xlsx-js-style"),
	headers: string[],
	rows: Cell[][],
	widths: number[],
) {
	const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]) as Sheet;
	headers.forEach((_, col) => {
		const ref = XLSX.utils.encode_cell({ r: 0, c: col });
		(sheet[ref] as { s?: unknown }).s = HEADER_STYLE;
	});
	rows.forEach((row, r) => {
		row.forEach((value, col) => {
			if (typeof value === "string" && value.length > 40) {
				const ref = XLSX.utils.encode_cell({ r: r + 1, c: col });
				const cell = sheet[ref] as { s?: unknown } | undefined;
				if (cell) cell.s = WRAP;
			}
		});
	});
	sheet["!cols"] = widths.map((wch) => ({ wch }));
	if (rows.length > 0) {
		sheet["!autofilter"] = {
			ref: XLSX.utils.encode_range({
				s: { r: 0, c: 0 },
				e: { r: rows.length, c: headers.length - 1 },
			}),
		};
	}
	return sheet;
}

function summarySheet(
	XLSX: typeof import("xlsx-js-style"),
	data: FeedbackExportData,
) {
	const s = data.summary;
	const aoa: Cell[][] = [
		[data.form.title],
		[data.event.title],
		[`Generated ${formatDateTime(data.generated_at)}`],
		[`Filters: ${filtersDescription(data)}`],
		[],
		["Responses", s.total_responses],
		["Response rate", responseRateText(data)],
		["Average score", s.overall_average ?? "—"],
		[
			"Satisfied (rated 4 or 5)",
			s.overall_satisfied_percent != null
				? `${s.overall_satisfied_percent}%`
				: "—",
		],
		[],
		["Question", "Type", "Seen by", "Answered", "Result"],
		...s.questions.map((question, index) => [
			`Q${index + 1}. ${question.question_text}`,
			question.question_type.replace(/_/g, " "),
			question.seen_count ?? question.answered_count,
			question.answered_count,
			describeResult(question),
		]),
	];
	const sheet = XLSX.utils.aoa_to_sheet(aoa) as Sheet;
	const bold = { font: { bold: true } };
	(sheet[XLSX.utils.encode_cell({ r: 0, c: 0 })] as { s?: unknown }).s = {
		font: { bold: true, sz: 14 },
	};
	for (const r of [5, 6, 7, 8]) {
		(sheet[XLSX.utils.encode_cell({ r, c: 0 })] as { s?: unknown }).s = bold;
	}
	for (let c = 0; c < 5; c++) {
		(sheet[XLSX.utils.encode_cell({ r: 10, c })] as { s?: unknown }).s =
			HEADER_STYLE;
	}
	for (let r = 11; r < aoa.length; r++) {
		const ref = XLSX.utils.encode_cell({ r, c: 4 });
		const cell = sheet[ref] as { s?: unknown } | undefined;
		if (cell) cell.s = WRAP;
	}
	sheet["!cols"] = [
		{ wch: 52 },
		{ wch: 16 },
		{ wch: 10 },
		{ wch: 10 },
		{ wch: 60 },
	];
	return sheet;
}

/** Summary, Responses, Comments and Questions sheets. */
export async function buildFeedbackWorkbook(
	data: FeedbackExportData,
	options: ExportOptions,
	aiSummary?: FeedbackAiSummary | null,
): Promise<Uint8Array> {
	const XLSX = await import("xlsx-js-style");
	const wb = XLSX.utils.book_new();

	XLSX.utils.book_append_sheet(
		wb,
		summarySheet(XLSX, data) as never,
		"Summary",
	);

	const responses = responseTable(data, options);
	XLSX.utils.book_append_sheet(
		wb,
		tableSheet(
			XLSX,
			responses.headers,
			responses.rows,
			responses.headers.map((h) => (h.startsWith("Q") ? 30 : 22)),
		) as never,
		"Responses",
	);

	const comments = commentTable(data, options);
	XLSX.utils.book_append_sheet(
		wb,
		tableSheet(
			XLSX,
			comments.headers,
			comments.rows,
			comments.headers.map((h) =>
				h === "Comment" ? 70 : h === "Question" ? 36 : 22,
			),
		) as never,
		"Comments",
	);

	const questions = questionTable(data);
	XLSX.utils.book_append_sheet(
		wb,
		tableSheet(
			XLSX,
			questions.headers,
			questions.rows,
			[5, 50, 16, 14, 10, 40, 40],
		) as never,
		"Questions",
	);

	if (aiSummary?.content) {
		const sheet = XLSX.utils.aoa_to_sheet(aiSummaryRows(aiSummary)) as Sheet;
		sheet["!cols"] = [
			{ wch: 34 },
			{ wch: 14 },
			{ wch: 16 },
			{ wch: 60 },
			{ wch: 70 },
		];
		(sheet[XLSX.utils.encode_cell({ r: 0, c: 0 })] as { s?: unknown }).s = {
			font: { bold: true, sz: 13 },
		};
		XLSX.utils.book_append_sheet(wb, sheet as never, "AI summary");
	}

	return new Uint8Array(
		XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer,
	);
}
