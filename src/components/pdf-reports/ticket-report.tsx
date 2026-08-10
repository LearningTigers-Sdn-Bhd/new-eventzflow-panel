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
import {
	calculatePercentage,
	formatReportCurrency,
	type TicketReportData,
} from "./types";

interface TicketAnalyticsReportProps {
	data: TicketReportData;
}

export function TicketAnalyticsReport({ data }: TicketAnalyticsReportProps) {
	const { event, metadata, stats, timeSeries, hourlyBreakdown } = data;
	const scanRate = calculatePercentage(stats.scannedTickets, stats.paidTickets);
	const checkInSummary = `${stats.scannedTickets.toLocaleString()} of ${stats.paidTickets.toLocaleString()} paid tickets checked in`;

	const insights = [
		`Total Issuance: ${stats.totalTickets.toLocaleString()} tickets have been issued or sold.`,
		`Collected Revenue: The event has collected ${formatReportCurrency(stats.totalRevenue)} in ticket sales.`,
		`Utilization: ${scanRate}% of paid tickets have been scanned at entry.`,
	];

	const registrationData =
		timeSeries.registrations?.map((d) => ({ date: d.date, value: d.value })) ??
		[];
	const scanData =
		timeSeries.scans?.map((d) => ({ date: d.date, value: d.value })) ?? [];
	const revenueData =
		timeSeries.revenue?.map((d) => ({ date: d.date, value: d.value })) ?? [];

	// Detect if data is hourly (single date) or daily (all time/event duration/pre-event)
	const isHourlyData =
		registrationData.length > 0 && registrationData[0]?.date?.includes(" ");

	// Dynamic subtitles based on data type
	const registrationSubtitle = isHourlyData
		? "Ticket sales over time"
		: "Daily Registration Breakdown by Date";
	const checkInSubtitle = isHourlyData
		? "Ticket scans over time"
		: "Daily Check-in Breakdown by Date";

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<ReportHeader
					eventName={event.name}
					reportType="ticket"
					metadata={metadata}
				/>

				<SummaryBox title="Performance Summary">
					<BulletList items={insights} />
				</SummaryBox>

				<Section title="Sales Overview">
					<StatsGrid>
						<StatsCard
							label="Collected Revenue"
							value={formatReportCurrency(stats.totalRevenue)}
						/>
						<StatsCard
							label="Pending Revenue"
							value={formatReportCurrency(stats.pendingRevenue)}
						/>
						<StatsCard
							label="Total Tickets"
							value={stats.totalTickets.toLocaleString()}
						/>
						<StatsCard
							label="Paid Tickets"
							value={stats.paidTickets.toLocaleString()}
							isLast
						/>
					</StatsGrid>
					<StatsGrid>
						<StatsCard
							label="Pending Tickets"
							value={stats.pendingTickets.toLocaleString()}
						/>
						<StatsCard label="Check-in Rate" value={`${scanRate}%`} />
						<StatsCard
							label="Scanned Tickets"
							value={stats.scannedTickets.toLocaleString()}
							subtext={`${scanRate}% of paid tickets checked in`}
						/>
						<StatsCard
							label="Unscanned Tickets"
							value={stats.unscannedTickets.toLocaleString()}
							isLast
						/>
					</StatsGrid>
				</Section>

				<View wrap={false}>
					<Section title="Utilization Ratio">
						<View style={{ alignItems: "center", paddingVertical: 12 }}>
							<DonutChart
								value1={stats.scannedTickets}
								value2={stats.unscannedTickets}
								label1="Scanned"
								label2="Unscanned"
								color1={colors.brandGreen}
								color2="#d1d5db"
								centerValue={`${scanRate}%`}
								centerLabel="Check-in Rate"
								summary={checkInSummary}
							/>
						</View>
					</Section>
				</View>

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
							title="Ticket Sales Volume"
							subtitle={registrationSubtitle}
							areaColor={colors.brandBlue}
						/>
					</View>
				</Section>

				{revenueData.length > 0 && (
					<Section title="Financial Performance">
						<AreaChart
							data={revenueData}
							title="Revenue Trend"
							subtitle="Daily revenue over time"
							areaColor={colors.success}
						/>
					</Section>
				)}

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
						<Section title="Hourly Sales Breakdown by Day">
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
