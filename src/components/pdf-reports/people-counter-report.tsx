"use client";

import { Document, Page } from "@react-pdf/renderer";
import { formatCount } from "@/components/pages/headcount/format";
import type { Headcount, HeadcountTrends } from "@/lib/api/event/hall";
import { AreaChart } from "./charts";
import {
	ReportFooter,
	Section,
	StatsCard,
	StatsGrid,
	Table,
} from "./components";
import { PeopleCounterMasthead } from "./people-counter-masthead";
import {
	chartSeries,
	hallRows,
	headlineFigures,
	levelRows,
	soFarSeries,
} from "./people-counter-rows";
import { colors, styles } from "./styles";

export interface PeopleCounterReportData {
	eventTitle: string;
	/** The day shown, already formatted, e.g. "Friday, 30 October 2026". */
	dayLabel: string;
	generatedAt: string;
	trends: HeadcountTrends;
	headcount: Headcount;
	/** Write times as 2:15 PM instead of 14:15. */
	hour12: boolean;
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

/** One day of the people counter, and nothing from other days: headline numbers, the day's charts, levels and halls. */
export function PeopleCounterReport({
	data,
}: {
	data: PeopleCounterReportData;
}) {
	const { trends, headcount, hour12 } = data;
	const figures = headlineFigures(trends, headcount, hour12);
	const points = trends.event.points;

	return (
		<Document title={`People counter - ${data.eventTitle}`} author="EventzFlow">
			<Page size="A4" style={styles.page}>
				<PeopleCounterMasthead
					eventTitle={data.eventTitle}
					subtitle={data.dayLabel}
					generatedAt={data.generatedAt}
				/>

				<StatsGrid>
					<StatsCard label="Visitors" value={formatCount(figures.entries)} />
					<StatsCard
						label="Peak crowd"
						value={formatCount(figures.peak)}
						subtext={figures.peakAt ? `at ${figures.peakAt}` : undefined}
					/>
					<StatsCard
						label="Busiest hour"
						value={formatCount(figures.busiest)}
						subtext={figures.busiestHour ?? undefined}
					/>
					<StatsCard
						label="Left"
						value={formatCount(figures.exits)}
						isLast={figures.soFar === null}
					/>
					{figures.soFar !== null && (
						<StatsCard
							label="Total so far"
							value={formatCount(figures.soFar)}
							subtext={`since ${figures.since}`}
							isLast
						/>
					)}
				</StatsGrid>
				<Section title="Through the day">
					<AreaChart
						data={chartSeries(points, "occupancy")}
						title="People inside"
						subtitle={data.dayLabel}
					/>
					<AreaChart
						data={chartSeries(points, "entries")}
						title="Visitors coming in"
						areaColor={colors.success}
					/>
					<AreaChart
						data={chartSeries(points, "exits")}
						title="People leaving"
						areaColor={colors.warning}
					/>
					{figures.soFar !== null && (
						<AreaChart
							data={soFarSeries(points, trends.event.beforeIn ?? 0)}
							title="Visitors so far"
							subtitle={`Since ${figures.since}`}
							areaColor={colors.success}
						/>
					)}
				</Section>

				<Section title="By level" breakOnPage>
					<Table
						headers={[
							"Level",
							"Capacity",
							"Peak crowd",
							"Peak at",
							"Visitors",
							"Left",
							"Peak vs capacity",
						]}
						columnWidths={["18%", "13%", "15%", "11%", "11%", "9%", "23%"]}
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
							"Visitors",
							"Left",
							"Status",
						]}
						columnWidths={["20%", "15%", "11%", "11%", "10%", "10%", "23%"]}
						columnAligns={HALL_ALIGNS}
						rows={hallRows(trends, headcount)}
					/>
				</Section>

				<ReportFooter />
			</Page>
		</Document>
	);
}
