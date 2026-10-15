"use client";

import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { formatCount } from "@/components/pages/headcount/format";
import type {
	DaySummary,
	Headcount,
	HeadcountTrends,
} from "@/lib/api/event/hall";
import { AreaChart } from "./charts";
import {
	ReportFooter,
	Section,
	StatsCard,
	StatsGrid,
	Table,
} from "./components";
import {
	chartSeries,
	dayRows,
	hallRows,
	headlineFigures,
	levelRows,
} from "./people-counter-rows";
import { colors, styles } from "./styles";

export interface PeopleCounterReportData {
	eventTitle: string;
	/** The day shown, already formatted, e.g. "Friday, 30 October 2026". */
	dayLabel: string;
	generatedAt: string;
	trends: HeadcountTrends;
	headcount: Headcount;
	/** Every event day so far; the day-by-day table shows only when there are two or more. */
	days: DaySummary[];
}

type Align = "left" | "right";

// Only the label columns are left-aligned. Right-aligning everything after them keeps a number
// from running into the text beside it (a right-aligned column next to a left-aligned one touches).
const LEVEL_ALIGNS: Align[] = [
	"left",
	"right",
	"right",
	"right",
	"right",
	"right",
	"right",
];
const HALL_ALIGNS: Align[] = [
	"left",
	"left",
	"right",
	"right",
	"right",
	"right",
	"right",
];
const DAY_ALIGNS: Align[] = [
	"left",
	"right",
	"right",
	"right",
	"right",
	"right",
];

/** One day of the people counter as a printable summary: headline numbers, charts, levels, halls and the event's days. */
export function PeopleCounterReport({
	data,
}: {
	data: PeopleCounterReportData;
}) {
	const { trends, headcount, days } = data;
	const figures = headlineFigures(trends, headcount);
	const points = trends.event.points;

	return (
		<Document title={`People counter - ${data.eventTitle}`} author="EventzFlow">
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<View style={styles.headerTop}>
						<Image
							src="/logo/Logo.png"
							style={{ width: 120, height: 10, objectFit: "contain" }}
						/>
						<View style={{ alignItems: "flex-end" }}>
							<Text
								style={{
									fontSize: 12,
									fontFamily: "Helvetica-Bold",
									textTransform: "uppercase",
								}}
							>
								People counter report
							</Text>
							<Text
								style={{
									fontSize: 9,
									color: colors.textSecondary,
									marginTop: 4,
								}}
							>
								Generated {data.generatedAt}
							</Text>
						</View>
					</View>
					<Text style={styles.label}>Event</Text>
					<Text style={styles.h1}>{data.eventTitle}</Text>
					<Text style={styles.textSmall}>{data.dayLabel}</Text>
				</View>

				<StatsGrid>
					<StatsCard
						label="Peak crowd"
						value={formatCount(figures.peak)}
						subtext={figures.peakAt ? `at ${figures.peakAt}` : undefined}
					/>
					<StatsCard label="Came in" value={formatCount(figures.entries)} />
					<StatsCard label="Left" value={formatCount(figures.exits)} />
					<StatsCard
						label="Busiest hour"
						value={formatCount(figures.busiest)}
						subtext={figures.busiestHour ?? undefined}
						isLast
					/>
				</StatsGrid>
				<StatsGrid>
					<StatsCard
						label="Inside at close"
						value={formatCount(figures.closing)}
					/>
					<StatsCard
						label="Total capacity"
						value={formatCount(figures.capacity)}
						isLast
					/>
				</StatsGrid>

				<Section title="People inside">
					<AreaChart
						data={chartSeries(points, "occupancy")}
						title="People inside"
						subtitle={data.dayLabel}
					/>
				</Section>

				<Section title="Came in and left">
					<AreaChart
						data={chartSeries(points, "entries")}
						title="Came in"
						areaColor={colors.success}
					/>
					<AreaChart
						data={chartSeries(points, "exits")}
						title="Left"
						areaColor={colors.warning}
					/>
				</Section>

				<Section title="By level" breakOnPage>
					<Table
						headers={[
							"Level",
							"Capacity",
							"Peak crowd",
							"Peak at",
							"Came in",
							"Left",
							"Peak vs capacity",
						]}
						columnWidths={["20%", "12%", "12%", "11%", "11%", "11%", "23%"]}
						columnAligns={LEVEL_ALIGNS}
						rows={levelRows(trends, headcount)}
					/>
				</Section>

				<Section title="By hall">
					<Table
						headers={[
							"Hall",
							"Level",
							"Capacity",
							"Peak crowd",
							"Came in",
							"Left",
							"Status",
						]}
						columnWidths={["20%", "15%", "11%", "11%", "10%", "10%", "23%"]}
						columnAligns={HALL_ALIGNS}
						rows={hallRows(trends, headcount)}
					/>
				</Section>

				{days.length >= 2 && (
					<Section title="Day by day">
						<Table
							headers={[
								"Day",
								"Came in",
								"Left",
								"Peak crowd",
								"Busiest hour",
								"Inside at close",
							]}
							columnWidths={["16%", "14%", "14%", "20%", "20%", "16%"]}
							columnAligns={DAY_ALIGNS}
							rows={dayRows(days)}
						/>
					</Section>
				)}

				<ReportFooter />
			</Page>
		</Document>
	);
}
