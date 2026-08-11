"use client";

import { Document, Page, View } from "@react-pdf/renderer";
import { AreaChart } from "./charts";
import {
	BulletList,
	ReportFooter,
	ReportHeader,
	Section,
	StatsCard,
	StatsGrid,
	SummaryBox,
	Table,
} from "./components";
import { colors, styles } from "./styles";
import {
	calculatePercentage,
	type ExhibitorReportData,
	formatReportCurrency,
} from "./types";

interface ExhibitorAnalyticsReportProps {
	data: ExhibitorReportData;
}

export function ExhibitorAnalyticsReport({
	data,
}: ExhibitorAnalyticsReportProps) {
	const { event, metadata, stats, breakdown, timeSeries } = data;
	const hasTrendData =
		timeSeries.bookings.length > 0 || timeSeries.revenue.length > 0;
	const paidRate = calculatePercentage(stats.paidPartners, stats.totalPartners);

	const insights = [
		`Total Exhibitors: ${stats.totalPartners.toLocaleString()} booths booked for the event.`,
		`Paid: ${stats.paidPartners.toLocaleString()} exhibitors (${paidRate}%) are paid, waived, or sponsored.`,
		`Collected Revenue: ${formatReportCurrency(stats.collectedRevenue)} in booth sales, separate from visitor and participant sales.`,
	];

	const rows = breakdown.map((row) => [
		row.label,
		row.zone ?? "—",
		row.bookedQuantity,
		row.paidQuantity,
		row.unpaidQuantity,
		formatReportCurrency(row.collectedRevenue),
		formatReportCurrency(row.pendingRevenue),
	]);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<ReportHeader
					eventName={event.name}
					reportType="exhibitor"
					metadata={metadata}
				/>

				<SummaryBox title="Performance Summary">
					<BulletList items={insights} />
				</SummaryBox>

				<Section title="Exhibitor Sales Overview">
					<StatsGrid>
						<StatsCard label="Total Exhibitors" value={stats.totalPartners} />
						<StatsCard
							label="Paid"
							value={stats.paidPartners}
							subtext={`${paidRate}% paid`}
						/>
						<StatsCard label="Unpaid" value={stats.unpaidPartners} />
						<StatsCard
							label="Collected Revenue"
							value={formatReportCurrency(stats.collectedRevenue)}
						/>
						<StatsCard
							label="Pending Revenue"
							value={formatReportCurrency(stats.pendingRevenue)}
							isLast
						/>
					</StatsGrid>
				</Section>

				{hasTrendData && (
					<Section title="Sales Activity Over Time" breakOnPage>
						<View style={{ marginBottom: 24 }}>
							<AreaChart
								data={timeSeries.bookings}
								title="Booth Bookings"
								subtitle="Booth bookings over time"
								areaColor={colors.brandBlue}
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
								data={timeSeries.revenue}
								title="Booth Revenue"
								subtitle="Collected exhibitor revenue over time"
								areaColor={colors.brandGreen}
							/>
						</View>
					</Section>
				)}

				<Section title="Booth Pricing Breakdown" breakOnPage>
					<Table
						headers={[
							"Pricing",
							"Zone",
							"Booked",
							"Paid",
							"Unpaid",
							"Collected",
							"Pending",
						]}
						rows={rows}
						columnWidths={["24%", "16%", "10%", "10%", "10%", "15%", "15%"]}
					/>
				</Section>

				<ReportFooter />
			</Page>
		</Document>
	);
}
