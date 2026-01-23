"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
	ReportHeader,
	ReportFooter,
	Section,
	StatsCard,
	StatsGrid,
	SummaryBox,
	RateIndicator,
	BulletList,
} from "./components";
import { DonutChart, BarChart } from "./charts";
import { styles, colors } from "./styles";
import {
	type VisitorReportData,
	calculatePercentage,
} from "./types";

interface VisitorAnalyticsReportProps {
	data: VisitorReportData;
}

export function VisitorAnalyticsReport({ data }: VisitorAnalyticsReportProps) {
	const { event, metadata, stats, timeSeries } = data;
	const scanRate = calculatePercentage(stats.scannedVisitors, stats.totalVisitors);

	// Generate summary insights
	const insights = [];
	if (stats.totalVisitors > 0) {
		insights.push(
			`Total of ${stats.totalVisitors.toLocaleString()} visitors registered for this event.`,
		);
	}
	if (scanRate >= 80) {
		insights.push(
			`Excellent check-in rate of ${scanRate}% - most visitors have arrived.`,
		);
	} else if (scanRate >= 50) {
		insights.push(
			`Good check-in progress at ${scanRate}% - over half of visitors checked in.`,
		);
	} else if (stats.totalVisitors > 0) {
		insights.push(
			`Current check-in rate is ${scanRate}% - ${stats.unscannedVisitors.toLocaleString()} visitors pending.`,
		);
	}

	// Prepare chart data
	const registrationData = timeSeries.registrations?.map((d) => ({
		date: d.date,
		value: d.value,
	})) ?? [];

	const scanData = timeSeries.scans?.map((d) => ({
		date: d.date,
		value: d.value,
	})) ?? [];

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<ReportHeader
					eventName={event.name}
					reportType="visitor"
					metadata={metadata}
				/>

				{/* Executive Summary */}
				<SummaryBox title="Executive Summary">
					<BulletList items={insights.length > 0 ? insights : ["No visitor data available for this period."]} />
				</SummaryBox>

				{/* Key Metrics Section */}
				<Section title="Key Metrics">
					<View style={{ flexDirection: "row", gap: 16 }}>
						{/* Left side: Stats Cards */}
						<View style={{ flex: 1 }}>
							<StatsGrid>
								<StatsCard
									label="Total Visitors"
									value={stats.totalVisitors.toLocaleString()}
								/>
								<StatsCard
									label="Checked-In"
									value={stats.scannedVisitors.toLocaleString()}
								/>
								<StatsCard
									label="Pending"
									value={stats.unscannedVisitors.toLocaleString()}
									fullWidth
								/>
							</StatsGrid>
							<RateIndicator label="Check-in Rate" rate={scanRate} />
						</View>
						{/* Right side: Donut Chart */}
						<DonutChart
							value1={stats.scannedVisitors}
							value2={stats.unscannedVisitors}
							label1="Checked-In"
							label2="Pending"
							color1={colors.accent}
							color2={colors.border}
						/>
					</View>
				</Section>

				{/* Daily Breakdown - Stacked Layout */}
				{(registrationData.length > 0 || scanData.length > 0) && (
					<Section title="Daily Breakdown">
						{registrationData.length > 0 && (
							<View style={{
								borderWidth: 1,
								borderColor: colors.border,
								padding: 12,
								backgroundColor: colors.white,
							}}>
								<BarChart
									data={registrationData}
									title="Registrations by Day"
									maxBars={6}
									barColor={colors.accent}
								/>
							</View>
						)}
						{scanData.length > 0 && (
							<View style={{
								borderWidth: 1,
								borderColor: colors.border,
								padding: 12,
								backgroundColor: colors.white,
								marginTop: registrationData.length > 0 ? 12 : 0,
							}}>
								<BarChart
									data={scanData}
									title="Check-ins by Day"
									maxBars={6}
									barColor={colors.brandBlue}
								/>
							</View>
						)}
					</Section>
				)}

				<ReportFooter />
			</Page>
		</Document>
	);
}
