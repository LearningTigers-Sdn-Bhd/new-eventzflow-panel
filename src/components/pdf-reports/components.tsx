"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { styles, colors } from "./styles";
import {
	type AnalyticsReportData,
	type ReportMetadata,
	formatReportDate,
	getEventDateRangeLabel,
	getReportTypeLabel,
} from "./types";

/**
 * Text-based Logo Component (matching floating-nav style)
 */
function LogoText() {
	return (
		<Text style={{ fontFamily: "Times-Roman", fontSize: 18, fontWeight: "bold" }}>
			<Text style={{ color: colors.brandGreen }}>Event</Text>
			<Text style={{ color: colors.brandBlue }}>z</Text>
			<Text style={{ color: colors.brandGreen }}>Flow</Text>
		</Text>
	);
}

/**
 * Report Header Component
 * Swiss International Design: Clean stacked layout that handles long titles
 */
export function ReportHeader({
	eventName,
	reportType,
	metadata,
}: {
	eventName: string;
	reportType: AnalyticsReportData["type"];
	metadata: ReportMetadata;
}) {
	return (
		<View style={styles.header}>
			{/* Top row: Logo and metadata */}
			<View style={styles.headerTop}>
				<LogoText />
				<View style={styles.headerMeta}>
					<Text style={styles.reportTitle}>{getReportTypeLabel(reportType)}</Text>
					<Text style={styles.reportSubtitle}>
						{getEventDateRangeLabel(metadata.eventStartDate, metadata.eventEndDate)}
					</Text>
					<Text style={styles.reportDate}>
						Generated {formatReportDate(metadata.generatedAt)}
					</Text>
				</View>
			</View>
			{/* Event name on its own line - allows for long titles */}
			<Text style={styles.eventName}>{eventName}</Text>
		</View>
	);
}

/**
 * Report Footer Component
 */
export function ReportFooter() {
	return (
		<View style={styles.footer} fixed>
			<Text style={styles.footerBrand}>EventzFlow</Text>
			<Text style={styles.footerText}>
				Confidential - For internal use only
			</Text>
			<Text
				style={styles.pageNumber}
				render={({ pageNumber, totalPages }) =>
					`${pageNumber} / ${totalPages}`
				}
			/>
		</View>
	);
}

/**
 * Section Component
 */
export function Section({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>{title}</Text>
			{children}
		</View>
	);
}

/**
 * Stats Card Component
 */
export function StatsCard({
	label,
	value,
	fullWidth = false,
}: {
	label: string;
	value: string | number;
	fullWidth?: boolean;
}) {
	return (
		<View style={fullWidth ? styles.statsCardFull : styles.statsCard}>
			<Text style={styles.statsLabel}>{label}</Text>
			<Text style={styles.statsValue}>{value}</Text>
		</View>
	);
}

/**
 * Stats Grid Component
 */
export function StatsGrid({ children }: { children: ReactNode }) {
	return <View style={styles.statsGrid}>{children}</View>;
}

/**
 * Summary Box Component
 */
export function SummaryBox({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<View style={styles.summaryBox}>
			<Text style={styles.summaryTitle}>{title}</Text>
			{children}
		</View>
	);
}

/**
 * Table Component
 */
export function Table({
	headers,
	rows,
	columnWidths,
}: {
	headers: string[];
	rows: (string | number)[][];
	columnWidths: string[];
}) {
	return (
		<View style={styles.table}>
			<View style={styles.tableHeader}>
				{headers.map((header, index) => (
					<Text
						key={`header-${header}-${index}`}
						style={[styles.tableHeaderCell, { width: columnWidths[index] }]}
					>
						{header}
					</Text>
				))}
			</View>
			{rows.length > 0 ? (
				rows.map((row, rowIndex) => (
					<View
						key={`row-${rowIndex}`}
						style={rowIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
					>
						{row.map((cell, cellIndex) => (
							<Text
								key={`cell-${rowIndex}-${cellIndex}`}
								style={[styles.tableCell, { width: columnWidths[cellIndex] }]}
							>
								{cell}
							</Text>
						))}
					</View>
				))
			) : (
				<View style={styles.emptyState}>
					<Text style={styles.emptyStateText}>No data available</Text>
				</View>
			)}
		</View>
	);
}

/**
 * Time Series Data Grid Component
 */
export function TimeSeriesGrid({
	title,
	data,
	formatValue,
}: {
	title: string;
	data: { period: string; value: number }[] | { date: string; value?: number; count?: number }[];
	formatValue?: (value: number) => string;
}) {
	const normalizedData = data.map((item) => ({
		period: "period" in item ? item.period : item.date,
		value: "value" in item && item.value !== undefined ? item.value : ("count" in item ? item.count ?? 0 : 0),
	}));

	if (normalizedData.length === 0) {
		return (
			<View style={styles.timeSeriesSection}>
				<Text style={styles.timeSeriesTitle}>{title}</Text>
				<View style={styles.emptyState}>
					<Text style={styles.emptyStateText}>No data for this period</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.timeSeriesSection}>
			<Text style={styles.timeSeriesTitle}>{title}</Text>
			<View style={styles.timeSeriesGrid}>
				{normalizedData.slice(0, 12).map((item, index) => (
					<View key={`ts-${index}`} style={styles.timeSeriesItem}>
						<Text style={styles.timeSeriesPeriod}>{item.period}</Text>
						<Text style={styles.timeSeriesValue}>
							{formatValue ? formatValue(item.value) : item.value.toLocaleString()}
						</Text>
					</View>
				))}
			</View>
			{normalizedData.length > 12 && (
				<Text style={[styles.emptyStateText, { marginTop: 8 }]}>
					Showing first 12 of {normalizedData.length} entries
				</Text>
			)}
		</View>
	);
}

/**
 * Rate/Progress Bar Component
 * Uses accent color (brand green) for the fill
 */
export function RateIndicator({
	label,
	rate,
	color = colors.accent,
}: {
	label: string;
	rate: number;
	color?: string;
}) {
	const clampedRate = Math.min(100, Math.max(0, rate));

	return (
		<View style={styles.rateContainer}>
			<View style={styles.rateBar}>
				<View
					style={[
						styles.rateFill,
						{ width: `${clampedRate}%`, backgroundColor: color },
					]}
				/>
			</View>
			<Text style={styles.rateLabel}>
				{label}: {rate.toFixed(1)}%
			</Text>
		</View>
	);
}

/**
 * Metric Highlight Component
 * For displaying key metrics like check-in rate prominently
 */
export function MetricHighlight({
	value,
	label,
}: {
	value: string | number;
	label: string;
}) {
	return (
		<View style={styles.metricHighlight}>
			<Text style={styles.metricValue}>{value}</Text>
			<Text style={styles.metricLabel}>{label}</Text>
		</View>
	);
}

/**
 * List Component
 */
export function BulletList({ items }: { items: string[] }) {
	return (
		<View style={styles.list}>
			{items.map((item, index) => (
				<View key={`bullet-${index}`} style={styles.listItem}>
					<Text style={styles.listBullet}>{"\u2022"}</Text>
					<Text style={styles.listText}>{item}</Text>
				</View>
			))}
		</View>
	);
}
