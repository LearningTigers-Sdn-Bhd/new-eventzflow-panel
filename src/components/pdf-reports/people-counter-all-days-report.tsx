"use client";

import { Document, Page, View } from "@react-pdf/renderer";
import { formatCount } from "@/components/pages/headcount/format";
import { shortDayLabel } from "@/components/pages/headcount/trend-format";
import type { DaySummary, Headcount, TrendPoint } from "@/lib/api/event/hall";
import { AreaChart, BarChart } from "./charts";
import {
	ReportFooter,
	Section,
	StatsCard,
	StatsGrid,
	Table,
} from "./components";
import { PeopleCounterMasthead } from "./people-counter-masthead";
import {
	allDaysFigures,
	chartSeries,
	dayBars,
	dayRows,
	hallDayRows,
	hallTotalRows,
} from "./people-counter-rows";
import { colors, styles } from "./styles";

export interface PeopleCounterAllDaysReportData {
	eventTitle: string;
	/** What the report covers, e.g. "20 Oct to 21 Oct 2026". */
	rangeLabel: string;
	generatedAt: string;
	headcount: Headcount;
	/** Every event day so far, at least one. */
	days: DaySummary[];
	/** Hourly counts per day for the charts; a day with no read is left out. */
	hourly: { date: string; points: TrendPoint[] }[];
	/** Write times as 2:15 PM instead of 14:15. */
	hour12: boolean;
}

type Align = "left" | "right";

const DAY_ALIGNS: Align[] = ["left", "right", "right", "right", "right"];
const HALL_TOTAL_ALIGNS: Align[] = ["left", "left", "right", "right"];

/** The matrix columns: hall, level, one per day, total. Days share what is left after the label columns. */
function matrixLayout(days: DaySummary[]) {
	const dayWidth = Math.floor(50 / days.length);
	return {
		headers: [
			"Hall",
			"Level",
			...days.map((d) => shortDayLabel(d.date)),
			"Total",
		],
		widths: ["22%", "14%", ...days.map(() => `${dayWidth}%`), "14%"],
		aligns: [
			"left",
			"left",
			...days.map((): Align => "right"),
			"right",
		] as Align[],
	};
}

/** The whole event as a printable summary: totals, every day side by side, hall totals, and each day's crowd through the day. */
export function PeopleCounterAllDaysReport({
	data,
}: {
	data: PeopleCounterAllDaysReportData;
}) {
	const { days, headcount, hourly, hour12 } = data;
	const figures = allDaysFigures(days, hour12);
	const showMatrix = days.length <= 8 && headcount.halls.length >= 2;
	const matrix = matrixLayout(days);

	return (
		<Document
			title={`People counter, all days - ${data.eventTitle}`}
			author="EventzFlow"
		>
			<Page size="A4" style={styles.page}>
				<PeopleCounterMasthead
					eventTitle={data.eventTitle}
					subtitle={`All days · ${data.rangeLabel}`}
					generatedAt={data.generatedAt}
				/>

				<StatsGrid>
					<StatsCard
						label="Visitors · all days"
						value={formatCount(figures.total)}
						subtext={`${days.length} ${days.length === 1 ? "day" : "days"} counted`}
					/>
					<StatsCard
						label="Best day"
						value={formatCount(figures.best.entries)}
						subtext={shortDayLabel(figures.best.date)}
					/>
					<StatsCard
						label="Average per day"
						value={formatCount(figures.average)}
					/>
					<StatsCard
						label="Peak crowd"
						value={formatCount(figures.crowded?.peak?.occupancy ?? null)}
						subtext={
							figures.crowded
								? `${shortDayLabel(figures.crowded.date)} at ${figures.crowdedAt}`
								: undefined
						}
						isLast
					/>
				</StatsGrid>
				<StatsGrid>
					<StatsCard
						label="Left · all days"
						value={formatCount(figures.exits)}
					/>
					<StatsCard
						label="Quietest day"
						value={formatCount(figures.quiet.entries)}
						subtext={shortDayLabel(figures.quiet.date)}
						isLast={!headcount.event.capacity}
					/>
					{headcount.event.capacity ? (
						<StatsCard
							label="Total capacity"
							value={formatCount(headcount.event.capacity)}
							isLast
						/>
					) : null}
				</StatsGrid>

				<Section title="Visitors per day">
					<BarChart
						data={dayBars(days)}
						maxBars={14}
						barColor={colors.success}
					/>
					<Table
						headers={["Day", "Visitors", "Left", "Peak crowd", "Busiest hour"]}
						columnWidths={["16%", "16%", "14%", "27%", "27%"]}
						columnAligns={DAY_ALIGNS}
						rows={dayRows(days, hour12)}
					/>
				</Section>

				{headcount.halls.length >= 2 && (
					<Section title="Hall totals">
						<Table
							headers={["Hall", "Level", "Visitors · whole event", "Share"]}
							columnWidths={["34%", "26%", "24%", "16%"]}
							columnAligns={HALL_TOTAL_ALIGNS}
							rows={hallTotalRows(headcount)}
						/>
					</Section>
				)}

				{showMatrix && (
					<Section title="Visitors by hall, day by day">
						<Table
							headers={matrix.headers}
							columnWidths={matrix.widths}
							columnAligns={matrix.aligns}
							rows={hallDayRows(days)}
						/>
					</Section>
				)}

				{hourly.length > 0 && (
					<Section title="People inside, day by day">
						{hourly.map((day) => (
							<View key={day.date} wrap={false}>
								<AreaChart
									data={chartSeries(day.points, "occupancy")}
									title={shortDayLabel(day.date)}
									subtitle="People inside"
								/>
							</View>
						))}
					</Section>
				)}

				{hourly.length > 0 && (
					<Section title="Visitors coming in, day by day" breakOnPage>
						{hourly.map((day) => (
							<View key={day.date} wrap={false}>
								<AreaChart
									data={chartSeries(day.points, "entries")}
									title={shortDayLabel(day.date)}
									subtitle="Visitors coming in"
									areaColor={colors.success}
								/>
							</View>
						))}
					</Section>
				)}

				<ReportFooter />
			</Page>
		</Document>
	);
}
