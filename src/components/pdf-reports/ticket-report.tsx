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
	type TicketReportData,
	formatReportCurrency,
	calculatePercentage,
} from "./types";

interface TicketAnalyticsReportProps {
	data: TicketReportData;
}

export function TicketAnalyticsReport({ data }: TicketAnalyticsReportProps) {
	const { event, metadata, stats, timeSeries } = data;
	const scanRate = calculatePercentage(stats.scannedTickets, stats.totalTickets);

	// Generate summary insights
	const insights = [];
	if (stats.totalTickets > 0) {
		insights.push(
			`Total of ${stats.totalTickets.toLocaleString()} tickets registered for this event.`,
		);
	}
	if (scanRate >= 80) {
		insights.push(
			`Excellent check-in rate of ${scanRate}% - most attendees have arrived.`,
		);
	} else if (scanRate >= 50) {
		insights.push(
			`Good check-in progress at ${scanRate}% - over half of attendees checked in.`,
		);
	} else if (stats.totalTickets > 0) {
		insights.push(
			`Current check-in rate is ${scanRate}% - ${stats.unscannedTickets.toLocaleString()} tickets pending.`,
		);
	}
	if (stats.totalRevenue > 0) {
		insights.push(
			`Total revenue generated: ${formatReportCurrency(stats.totalRevenue)}.`,
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

	const revenueData = timeSeries.revenue?.map((d) => ({
		date: d.date,
		value: d.value,
	})) ?? [];

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<ReportHeader
					eventName={event.name}
					reportType="ticket"
					metadata={metadata}
				/>

				{/* Executive Summary */}
				<SummaryBox title="Executive Summary">
					<BulletList items={insights.length > 0 ? insights : ["No ticket data available for this period."]} />
				</SummaryBox>

				{/* Key Metrics Section */}
				<Section title="Key Metrics">
					<View style={{ flexDirection: "row", gap: 16 }}>
						{/* Left side: Stats Cards */}
						<View style={{ flex: 1 }}>
							<StatsGrid>
								<StatsCard
									label="Total Tickets"
									value={stats.totalTickets.toLocaleString()}
								/>
								<StatsCard
									label="Scanned"
									value={stats.scannedTickets.toLocaleString()}
								/>
								<StatsCard
									label="Unscanned"
									value={stats.unscannedTickets.toLocaleString()}
								/>
								<StatsCard
									label="Revenue"
									value={formatReportCurrency(stats.totalRevenue)}
								/>
							</StatsGrid>
							<RateIndicator label="Check-in Rate" rate={scanRate} />
						</View>
						{/* Right side: Donut Chart */}
						<DonutChart
							value1={stats.scannedTickets}
							value2={stats.unscannedTickets}
							label1="Scanned"
							label2="Unscanned"
							color1={colors.accent}
							color2={colors.border}
						/>
					</View>
				</Section>

				{/* Daily Breakdown - Stacked Layout */}
				{registrationData.length > 0 && (
					<Section title="Daily Breakdown">
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
						{scanData.length > 0 && (
							<View style={{
								borderWidth: 1,
								borderColor: colors.border,
								padding: 12,
								backgroundColor: colors.white,
								marginTop: 12,
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

			{/* Second page for revenue if needed */}
			{revenueData.length > 0 && (
				<Page size="A4" style={styles.page}>
					<Section title="Revenue Trend">
						<View style={{
							borderWidth: 1,
							borderColor: colors.border,
							padding: 12,
							backgroundColor: colors.white,
						}}>
							<BarChart
								data={revenueData}
								title="Daily Revenue"
								formatValue={(v) => formatReportCurrency(v)}
								maxBars={10}
								barColor={colors.accent}
							/>
						</View>
					</Section>
					<ReportFooter />
				</Page>
			)}
		</Document>
	);
}
