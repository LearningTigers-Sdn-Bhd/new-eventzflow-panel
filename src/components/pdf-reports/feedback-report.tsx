"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import type {
	FeedbackAiSummary,
	FeedbackExportData,
	FeedbackSummaryQuestion,
} from "@/lib/api/feedback-form";
import { AreaChart } from "./charts";
import {
	ReportFooter,
	Section,
	StatsCard,
	StatsGrid,
	Table,
} from "./components";
import { needsSanitizing, sanitizeForPdf as safe } from "./pdf-text";
import { colors, styles } from "./styles";
import { formatReportDate, formatReportDateTime } from "./types";

const MAX_COMMENTS = 25;

export interface FeedbackReportOptions {
	/** Show who wrote each comment. Off by default: the report is meant to be shared. */
	includeAttendee: boolean;
}

function filtersText(data: FeedbackExportData) {
	const parts: string[] = [];
	if (data.filters.ticket_type_id) parts.push("One ticket type");
	if (data.filters.from) parts.push(`from ${data.filters.from}`);
	if (data.filters.to) parts.push(`to ${data.filters.to}`);
	return parts.length > 0 ? parts.join(", ") : "All responses";
}

/** Labelled horizontal bar. Labels are plain text (not dates). */
function LabelBar({
	label,
	display,
	fraction,
	color = colors.brandSecondary,
}: {
	label: string;
	display: string;
	fraction: number;
	color?: string;
}) {
	return (
		<View style={{ marginBottom: 8 }} wrap={false}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					marginBottom: 3,
				}}
			>
				<Text
					style={{ fontSize: 9, color: colors.textSecondary, maxWidth: "70%" }}
				>
					{label}
				</Text>
				<Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
					{display}
				</Text>
			</View>
			<View
				style={{
					height: 10,
					width: "100%",
					backgroundColor: colors.background,
				}}
			>
				<View
					style={{
						width: `${Math.max(Math.min(fraction * 100, 100), fraction > 0 ? 1 : 0)}%`,
						height: "100%",
						backgroundColor: color,
					}}
				/>
			</View>
		</View>
	);
}

function QuestionBlock({
	question,
	index,
	total,
}: {
	question: FeedbackSummaryQuestion;
	index: number;
	total: number;
}) {
	const seen =
		question.seen_count !== undefined && question.seen_count < total
			? ` · shown to ${question.seen_count} of ${total}`
			: "";

	return (
		// Blocks may split across pages (each bar stays whole), so a tall block
		// never leaves a big blank gap; minPresenceAhead keeps titles off page bottoms.
		<View style={{ marginBottom: 18 }}>
			<Text
				minPresenceAhead={90}
				style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 }}
			>
				{safe(`Q${index + 1}. ${question.question_text}`)}
			</Text>
			<Text style={[styles.textSmall, { marginBottom: 8 }]}>
				{`${question.answered_count} answered${seen}`}
			</Text>

			{question.question_type === "rating" ? (
				<View>
					<Text
						style={{
							fontSize: 18,
							fontFamily: "Helvetica-Bold",
							marginBottom: 6,
						}}
					>
						{`${(question.average ?? 0).toFixed(1)} / 5`}
						{question.satisfied_percent != null
							? `   ${question.satisfied_percent}% satisfied`
							: ""}
					</Text>
					{[5, 4, 3, 2, 1].map((rating) => {
						const count = question.distribution?.[String(rating)] ?? 0;
						return (
							<LabelBar
								key={rating}
								label={`${rating} star${rating === 1 ? "" : "s"}`}
								display={String(count)}
								fraction={
									question.answered_count === 0
										? 0
										: count / question.answered_count
								}
							/>
						);
					})}
					{(question.by_ticket_type ?? []).length > 1 && (
						<View style={{ marginTop: 6 }} wrap={false}>
							<Table
								headers={["Ticket type", "Average", "Responses"]}
								rows={(question.by_ticket_type ?? []).map((row) => [
									safe(row.ticket_type_name ?? "Ticket"),
									row.average.toFixed(1),
									row.count,
								])}
								columnWidths={["60%", "20%", "20%"]}
							/>
						</View>
					)}
				</View>
			) : question.question_type === "text" ? (
				<Text style={styles.textSmall}>
					Written answers are listed under Comments below.
				</Text>
			) : (
				<View>
					{(question.options ?? []).map((option) => (
						<LabelBar
							key={option.label}
							label={safe(option.label)}
							display={`${option.percent}% (${option.count})`}
							fraction={option.percent / 100}
						/>
					))}
				</View>
			)}
		</View>
	);
}

export function FeedbackReport({
	data,
	options,
	aiSummary,
}: {
	data: FeedbackExportData;
	options: FeedbackReportOptions;
	/** Included only when the organizer chose to; always labelled AI-generated. */
	aiSummary?: FeedbackAiSummary | null;
}) {
	const s = data.summary;
	const rate = s.response_rate;
	const timeline = (s.timeline ?? []).map((point) => ({
		date: point.date,
		value: point.count,
	}));
	// Newest first; the export returns them oldest first.
	const comments = [...data.comments].reverse().slice(0, MAX_COMMENTS);

	return (
		<Document title={`${data.form.title} — feedback report`}>
			<Page size="A4" style={styles.page}>
				<View style={styles.header} fixed>
					<View style={styles.headerTop}>
						<Text
							style={{
								fontSize: 12,
								fontFamily: "Helvetica-Bold",
								textTransform: "uppercase",
							}}
						>
							Feedback report
						</Text>
						<Text style={{ fontSize: 9, color: colors.textSecondary }}>
							{`Generated ${formatReportDate(data.generated_at)}`}
						</Text>
					</View>
					<Text style={styles.label}>Event</Text>
					<Text style={styles.h1}>{safe(data.event.title)}</Text>
					<Text style={styles.text}>{safe(data.form.title)}</Text>
					<Text style={[styles.textSmall, { marginTop: 6 }]}>
						{`Showing: ${filtersText(data)}`}
					</Text>
				</View>

				<StatsGrid>
					<StatsCard label="Responses" value={s.total_responses} />
					<StatsCard
						label="Response rate"
						value={rate && rate.percent !== null ? `${rate.percent}%` : "—"}
						subtext={
							rate && rate.eligible > 0
								? `${rate.responded} of ${rate.eligible} checked in`
								: undefined
						}
					/>
					<StatsCard
						label="Average score"
						value={
							s.overall_average != null
								? `${s.overall_average.toFixed(1)} / 5`
								: "—"
						}
					/>
					<StatsCard
						label="Satisfied"
						value={
							s.overall_satisfied_percent != null
								? `${s.overall_satisfied_percent}%`
								: "—"
						}
						isLast
					/>
				</StatsGrid>

				{timeline.length > 1 && (
					<AreaChart data={timeline} title="Responses per day" height={120} />
				)}

				{aiSummary?.content && (
					<Section title="AI summary (AI-generated)">
						<View style={{ marginBottom: 6 }}>
							<Text style={styles.text}>
								{safe(aiSummary.content.overview)}
							</Text>
						</View>
						{aiSummary.content.themes.map((theme) => (
							<View key={theme.name} style={{ marginBottom: 8 }} wrap={false}>
								<Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
									{`${safe(theme.name)} (${theme.sentiment})`}
								</Text>
								<Text style={styles.textSmall}>{safe(theme.description)}</Text>
								{theme.quotes.map((quote) => (
									<Text
										key={quote}
										style={[styles.textSmall, { fontStyle: "italic" }]}
									>
										{`“${safe(quote)}”`}
									</Text>
								))}
							</View>
						))}
						{[
							["What went well", aiSummary.content.strengths],
							["What to fix", aiSummary.content.problems],
							["Suggested next steps", aiSummary.content.suggested_actions],
						].map(([title, items]) =>
							(items as string[]).length > 0 ? (
								<View
									key={title as string}
									style={{ marginBottom: 6 }}
									wrap={false}
								>
									<Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
										{title as string}
									</Text>
									{(items as string[]).map((item) => (
										<Text
											key={item}
											style={styles.textSmall}
										>{`• ${safe(item)}`}</Text>
									))}
								</View>
							) : null,
						)}
						<Text style={[styles.textSmall, { color: colors.textMuted }]}>
							{`AI-generated${aiSummary.model ? ` by ${safe(aiSummary.model)}` : ""} from ${aiSummary.comments_count} comments. It can miss nuance, so check it against the comments.`}
						</Text>
					</Section>
				)}

				<Section title="Results by question">
					{s.questions.map((question, index) => (
						<QuestionBlock
							key={question.id}
							question={question}
							index={index}
							total={s.total_responses}
						/>
					))}
				</Section>

				{comments.length > 0 && (
					<Section title="Comments">
						{comments.map((comment, index) => (
							<View
								// biome-ignore lint/suspicious/noArrayIndexKey: static list
								key={index}
								style={{
									marginBottom: 8,
									paddingLeft: 8,
									borderLeftWidth: 2,
									borderLeftColor: colors.brandSecondary,
								}}
								wrap={false}
							>
								<Text style={styles.text}>{safe(comment.answer_text)}</Text>
								<Text style={[styles.textSmall, { color: colors.textMuted }]}>
									{[
										options.includeAttendee
											? safe(
													comment.attendee_name || comment.attendee_email || "",
												)
											: null,
										formatReportDateTime(comment.submitted_at),
									]
										.filter(Boolean)
										.join(" · ")}
								</Text>
							</View>
						))}
						{comments.some((c) => needsSanitizing(c.answer_text)) && (
							<Text style={[styles.textSmall, { marginBottom: 6 }]}>
								Characters this report cannot draw (other languages, emoji) show
								as ?. The Excel and CSV exports keep the original text.
							</Text>
						)}
						{data.comments.length > MAX_COMMENTS && (
							<Text style={styles.textSmall}>
								{`Showing the latest ${MAX_COMMENTS} of ${data.comments.length} comments. The Excel export includes all of them.`}
							</Text>
						)}
					</Section>
				)}

				<ReportFooter />
			</Page>
		</Document>
	);
}
