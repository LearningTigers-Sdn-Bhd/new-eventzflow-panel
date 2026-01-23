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
	Table,
} from "./components";
import { DonutChart, BarChart, DistributionSummary } from "./charts";
import { styles, colors } from "./styles";
import {
	type VoucherReportData,
	formatReportCurrency,
	formatReportDateTime,
} from "./types";

interface VoucherAnalyticsReportProps {
	data: VoucherReportData;
}

export function VoucherAnalyticsReport({ data }: VoucherAnalyticsReportProps) {
	const { event, metadata, stats, timeSeries, topVouchers, latestTransactions } = data;

	// Generate summary insights
	const insights = [];
	if (stats.totalVouchersIssued > 0) {
		insights.push(
			`${stats.totalVouchersIssued.toLocaleString()} vouchers issued for this event.`,
		);
	}
	if (stats.totalRedemptions > 0) {
		insights.push(
			`${stats.totalRedemptions.toLocaleString()} redemptions recorded (${stats.redemptionRate.toFixed(1)}% rate).`,
		);
	}
	if (stats.totalSales > 0) {
		insights.push(
			`Total sales through voucher redemptions: ${formatReportCurrency(stats.totalSales)}.`,
		);
	}
	if (stats.totalDiscountValue > 0) {
		insights.push(
			`Total discount value provided: ${formatReportCurrency(stats.totalDiscountValue)}.`,
		);
	}

	// Prepare redemption chart data
	const redemptionData = timeSeries.redemptions?.map((d) => ({
		date: d.date,
		value: d.count,
	})) ?? [];

	// Prepare top vouchers table data
	const topVouchersRows = topVouchers.slice(0, 10).map((voucher, index) => [
		`${index + 1}`,
		voucher.voucher_title,
		voucher.vendor_name || "N/A",
		voucher.redemption_count.toString(),
	]);

	// Prepare top vouchers for distribution chart
	const topVouchersDistribution = topVouchers.slice(0, 5).map((voucher, index) => ({
		label: voucher.voucher_title.length > 25
			? `${voucher.voucher_title.substring(0, 25)}...`
			: voucher.voucher_title,
		value: voucher.redemption_count,
		color: index === 0 ? colors.accent : undefined,
	}));

	// Prepare latest transactions table data
	const transactionsRows = latestTransactions.slice(0, 8).map((tx) => [
		tx.voucher_title.length > 20 ? `${tx.voucher_title.substring(0, 20)}...` : tx.voucher_title,
		tx.vendor_name || "N/A",
		formatReportCurrency(Number.parseFloat(tx.transaction_gross_amount)),
		formatReportCurrency(Number.parseFloat(tx.discount_applied_value)),
	]);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<ReportHeader
					eventName={event.name}
					reportType="voucher"
					metadata={metadata}
				/>

				{/* Executive Summary */}
				<SummaryBox title="Executive Summary">
					<BulletList items={insights.length > 0 ? insights : ["No voucher data available for this period."]} />
				</SummaryBox>

				{/* Key Metrics Section */}
				<Section title="Key Metrics">
					<View style={{ flexDirection: "row", gap: 16 }}>
						{/* Left side: Stats Cards */}
						<View style={{ flex: 1 }}>
							<StatsGrid>
								<StatsCard
									label="Vouchers Issued"
									value={stats.totalVouchersIssued.toLocaleString()}
								/>
								<StatsCard
									label="Redemptions"
									value={stats.totalRedemptions.toLocaleString()}
								/>
								<StatsCard
									label="Total Sales"
									value={formatReportCurrency(stats.totalSales)}
								/>
								<StatsCard
									label="Total Discount"
									value={formatReportCurrency(stats.totalDiscountValue)}
								/>
							</StatsGrid>
							<RateIndicator label="Redemption Rate" rate={stats.redemptionRate} />
						</View>
						{/* Right side: Donut Chart */}
						<DonutChart
							value1={stats.totalRedemptions}
							value2={stats.totalVouchersIssued - stats.totalRedemptions}
							label1="Redeemed"
							label2="Unused"
							color1={colors.accent}
							color2={colors.border}
						/>
					</View>
				</Section>

				{/* Daily Redemption Trend */}
				{redemptionData.length > 0 && (
					<Section title="Daily Redemption Trend">
						<View style={{
							borderWidth: 1,
							borderColor: colors.border,
							padding: 12,
							backgroundColor: colors.white,
						}}>
							<BarChart
								data={redemptionData}
								title="Redemptions by Day"
								maxBars={8}
								barColor={colors.accent}
							/>
						</View>
					</Section>
				)}

				<ReportFooter />
			</Page>

			{/* Second page for tables and distribution */}
			{(topVouchers.length > 0 || latestTransactions.length > 0) && (
				<Page size="A4" style={styles.page}>
					{/* Top Vouchers Distribution */}
					{topVouchersDistribution.length > 0 && (
						<Section title="Top Vouchers Performance">
							<View style={{
								borderWidth: 1,
								borderColor: colors.border,
								padding: 12,
								backgroundColor: colors.white,
							}}>
								<DistributionSummary
									items={topVouchersDistribution}
									title="Redemptions by Voucher"
								/>
							</View>
						</Section>
					)}

					{/* Top Vouchers Table */}
					{topVouchers.length > 0 && (
						<Section title="Top Scanned Vouchers">
							<Table
								headers={["#", "Voucher Name", "Vendor", "Redemptions"]}
								rows={topVouchersRows}
								columnWidths={["8%", "47%", "25%", "20%"]}
							/>
						</Section>
					)}

					{/* Latest Transactions */}
					{latestTransactions.length > 0 && (
						<Section title="Latest Transactions">
							<Table
								headers={["Voucher", "Vendor", "Amount", "Discount"]}
								rows={transactionsRows}
								columnWidths={["35%", "25%", "20%", "20%"]}
							/>
						</Section>
					)}

					<ReportFooter />
				</Page>
			)}
		</Document>
	);
}
