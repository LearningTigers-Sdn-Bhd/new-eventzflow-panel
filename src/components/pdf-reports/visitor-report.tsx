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
import { calculatePercentage, type VisitorReportData } from "./types";

interface VisitorAnalyticsReportProps {
	data: VisitorReportData;
}

export function VisitorAnalyticsReport({ data }: VisitorAnalyticsReportProps) {
	const { event, metadata, stats, timeSeries } = data;
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

				<Section title="Attendance Overview">
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

				<Section title="Attendance Ratio">
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
							title="Registration Volume (Daily)"
							maxBars={20}
							barColor={colors.brandPrimary}
						/>
					</View>
				</Section>

				<ReportFooter />
			</Page>
		</Document>
	);
}
