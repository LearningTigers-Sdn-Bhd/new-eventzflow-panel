"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { AreaChart, DailyHourlyBreakdownSection, DonutChart } from "./charts";
import {
	BulletList,
	GridCol,
	GridRow,
	ReportFooter,
	ReportHeader,
	Section,
	StatsCard,
	StatsGrid,
	SummaryBox,
} from "./components";
import { colors, styles } from "./styles";
import { calculatePercentage, type VisitorReportData } from "./types";

interface VisitorAnalyticsReportProps {
	data: VisitorReportData;
}

export function VisitorAnalyticsReport({ data }: VisitorAnalyticsReportProps) {
	const { event, metadata, stats, timeSeries, hourlyBreakdown } = data;
	const scanRate = calculatePercentage(
		stats.scannedVisitors,
		stats.totalVisitors,
	);

	const insights = [
		`Total Registration: ${stats.totalVisitors.toLocaleString()} visitors have registered for the event.`,
		`Checked In: ${stats.scannedVisitors.toLocaleString()} visitors have arrived at the venue.`,
		`Attendance Rate: ${scanRate}% of registered visitors have checked in.`,
	];

	const registrationData =
		timeSeries.registrations?.map((d) => ({ date: d.date, value: d.value })) ??
		[];
	const scanData =
		timeSeries.scans?.map((d) => ({ date: d.date, value: d.value })) ?? [];

	// Detect if data is hourly (single date) or daily (all time/event duration/pre-event)
	const isHourlyData =
		registrationData.length > 0 && registrationData[0]?.date?.includes(" ");

	// Dynamic subtitles based on data type
	const registrationSubtitle = isHourlyData
		? "Registrations over time"
		: "Daily Registration Breakdown by Date";
	const checkInSubtitle = isHourlyData
		? "Check-ins over time"
		: "Daily Check-in Breakdown by Date";

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<ReportHeader
					eventName={event.name}
					reportType="visitor"
					metadata={metadata}
				/>

				<SummaryBox title="Performance Summary">
					<BulletList items={insights} />
				</SummaryBox>

				<Section title="Attendance Over Time">
					<StatsGrid>
						<StatsCard
							label="Total Registrations"
							value={stats.totalVisitors.toLocaleString()}
						/>
						<StatsCard
							label="Checked In"
							value={stats.scannedVisitors.toLocaleString()}
						/>
						<StatsCard
							label="Pending Arrival"
							value={stats.unscannedVisitors.toLocaleString()}
							subtext={`${scanRate}% Attendance`}
							isLast
						/>
					</StatsGrid>
				</Section>

				<Section title="Attendance Ratio Throughout The Event">
					<View style={{ alignItems: "center", paddingVertical: 12 }}>
						<DonutChart
							value1={stats.scannedVisitors}
							value2={stats.unscannedVisitors}
							label1="Arrived"
							label2="Pending"
							color1={colors.brandGreen}
							color2="#d1d5db"
						/>
					</View>
				</Section>

				<Section title="Daily Activity Analysis" breakOnPage>
					<View style={{ marginBottom: 24 }}>
						<AreaChart
							data={scanData}
							title="Check-in Volume"
							subtitle={checkInSubtitle}
							areaColor={colors.brandGreen}
						/>
					</View>

					<View
						style={{
							borderTopWidth: 1,
							borderTopColor: "#e5e7eb",
							paddingTop: 24,
						}}
					>
						<AreaChart
							data={registrationData}
							title="Registration Volume"
							subtitle={registrationSubtitle}
							areaColor={colors.brandBlue}
						/>
					</View>
				</Section>

				{/* Hourly Breakdown per Day - for multi-day events */}
				{hourlyBreakdown?.scans && hourlyBreakdown.scans.length > 0 && (
					<Section title="Hourly Check-in Breakdown by Day" breakOnPage>
						<DailyHourlyBreakdownSection
							data={hourlyBreakdown.scans}
							barColor={colors.brandGreen}
						/>
					</Section>
				)}

				{hourlyBreakdown?.registrations &&
					hourlyBreakdown.registrations.length > 0 && (
						<Section title="Hourly Registration Breakdown by Day">
							<DailyHourlyBreakdownSection
								data={hourlyBreakdown.registrations}
								barColor={colors.brandBlue}
							/>
						</Section>
					)}

				<ReportFooter />
			</Page>
		</Document>
	);
}
