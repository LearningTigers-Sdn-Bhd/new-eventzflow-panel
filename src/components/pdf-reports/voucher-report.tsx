"use client";

import { Document, Page, View } from "@react-pdf/renderer";
import { BarChart, DistributionSummary, DonutChart } from "./charts";
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
	Table,
} from "./components";
import { colors, styles } from "./styles";
import { formatReportCurrency, type VoucherReportData } from "./types";

interface VoucherAnalyticsReportProps {
	data: VoucherReportData;
}

export function VoucherAnalyticsReport({ data }: VoucherAnalyticsReportProps) {
	const {
		event,
		metadata,
		stats,
		timeSeries,
		topVouchers,
		latestTransactions,
	} = data;

	const insights = [
		`Program Reach: ${stats.totalVouchersIssued.toLocaleString()} vouchers distributed to attendees.`,
		`Conversion: ${stats.redemptionRate.toFixed(1)}% redemption rate achieved.`,
		`Economic Impact: ${formatReportCurrency(stats.totalSales)} in sales generated from voucher redemptions.`,
	];

	const redemptionData =
		timeSeries.redemptions?.map((d) => ({ date: d.date, value: d.count })) ??
		[];

	const topVouchersRows = topVouchers
		.slice(0, 10)
		.map((voucher, index) => [
			(index + 1).toString(),
			voucher.voucher_title,
			voucher.vendor_name || "-",
			voucher.redemption_count.toString(),
		]);

	const topVouchersDistribution = topVouchers
		.slice(0, 5)
		.map((voucher, index) => ({
			label:
				voucher.voucher_title.length > 25
					? `${voucher.voucher_title.substring(0, 25)}...`
					: voucher.voucher_title,
			value: voucher.redemption_count,
			color: index === 0 ? colors.brandSecondary : colors.textSecondary,
		}));

	const transactionsRows = latestTransactions
		.slice(0, 12)
		.map((tx) => [
			tx.voucher_title.length > 25
				? `${tx.voucher_title.substring(0, 25)}...`
				: tx.voucher_title,
			tx.vendor_name || "-",
			formatReportCurrency(Number.parseFloat(tx.transaction_gross_amount)),
		]);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<ReportHeader
					eventName={event.name}
					reportType="voucher"
					metadata={metadata}
				/>

				<SummaryBox title="Program Analysis">
					<BulletList items={insights} />
				</SummaryBox>

				<Section title="Performance Metrics">
					<StatsGrid>
						<StatsCard
							label="Vouchers Issued"
							value={stats.totalVouchersIssued.toLocaleString()}
						/>
						<StatsCard
							label="Redeemed"
							value={stats.totalRedemptions.toLocaleString()}
						/>
						<StatsCard
							label="Total Sales"
							value={formatReportCurrency(stats.totalSales)}
						/>
						<StatsCard
							label="Discounts Given"
							value={formatReportCurrency(stats.totalDiscountValue)}
							isLast
						/>
					</StatsGrid>
				</Section>

				<Section title="Redemption Analysis">
					<View style={{ alignItems: "center", paddingVertical: 12 }}>
						<DonutChart
							value1={stats.totalRedemptions}
							value2={stats.totalVouchersIssued - stats.totalRedemptions}
							label1="Redeemed"
							label2="Unused"
							color1={colors.brandGreen}
							color2="#d1d5db"
						/>
					</View>
				</Section>

				<Section title="Performance Distribution">
					<DistributionSummary
						items={topVouchersDistribution}
						title="Top Performing Vouchers"
					/>
				</Section>

				{redemptionData.length > 0 && (
					<Section title="Daily Redemption Trend" breakOnPage>
						<BarChart
							data={redemptionData}
							title="Redemption Volume (Daily)"
							maxBars={20}
							barColor={colors.brandSecondary}
						/>
					</Section>
				)}

				{topVouchers.length > 0 && (
					<Section title="Top Vouchers by Volume" breakOnPage>
						<Table
							headers={["#", "Voucher Name", "Vendor", "Count"]}
							rows={topVouchersRows}
							columnWidths={["10%", "45%", "30%", "15%"]}
						/>
					</Section>
				)}

				{latestTransactions.length > 0 && (
					<Section title="Recent Transactions">
						<Table
							headers={["Voucher", "Vendor", "Transaction Value"]}
							rows={transactionsRows}
							columnWidths={["40%", "30%", "30%"]}
						/>
					</Section>
				)}

				<ReportFooter />
			</Page>
		</Document>
	);
}
