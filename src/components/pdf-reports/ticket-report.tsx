"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { BarChart, DonutChart } from "./charts";
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
	const { event, metadata, stats, timeSeries } = data;
	const scanRate = calculatePercentage(
		stats.scannedTickets,
		stats.totalTickets,
	);

	const insights = [
		`Total Issuance: ${stats.totalTickets.toLocaleString()} tickets have been issued or sold.`,
		`Total Revenue: The event has generated ${formatReportCurrency(stats.totalRevenue)} in ticket sales.`,
		`Utilization: ${scanRate}% of issued tickets have been scanned at entry.`,
	];

	const registrationData =
		timeSeries.registrations?.map((d) => ({ date: d.date, value: d.value })) ??
		[];
	const scanData =
		timeSeries.scans?.map((d) => ({ date: d.date, value: d.value })) ?? [];
	const revenueData =
		timeSeries.revenue?.map((d) => ({ date: d.date, value: d.value })) ?? [];

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
							label="Total Revenue"
							value={formatReportCurrency(stats.totalRevenue)}
						/>
						<StatsCard
							label="Total Tickets"
							value={stats.totalTickets.toLocaleString()}
						/>
						<StatsCard
							label="Redeemed"
							value={stats.scannedTickets.toLocaleString()}
							subtext={`${scanRate}% Utilization`}
							isLast
						/>
					</StatsGrid>
				</Section>

				<Section title="Utilization Ratio">
					<View style={{ alignItems: "center", paddingVertical: 12 }}>
						<DonutChart
							value1={stats.scannedTickets}
							value2={stats.unscannedTickets}
							label1="Scanned"
							label2="Pending"
							color1={colors.brandGreen}
							color2="#d1d5db"
						/>
					</View>
				</Section>

				<Section title="Daily Activity Analysis" breakOnPage>
					<View style={{ marginBottom: 24 }}>
						<BarChart
							data={scanData}
							title="Check-in Volume (Daily)"
							maxBars={20}
							barColor={colors.brandGreen}
						/>
					</View>

					<View style={{ borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 24 }}>
						<BarChart
							data={registrationData}
							title="Ticket Sales Volume (Daily)"
							maxBars={20}
							barColor={colors.brandPrimary}
						/>
					</View>
				</Section>

				{revenueData.length > 0 && (
					<Section title="Financial Performance">
						<BarChart
							data={revenueData}
							title="Daily Revenue Trend"
							formatValue={(v) => formatReportCurrency(v)}
							maxBars={15}
							barColor={colors.success}
						/>
					</Section>
				)}

				<ReportFooter />
			</Page>
		</Document>
	);
}
