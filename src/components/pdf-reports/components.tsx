"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { colors, styles } from "./styles";
import {
	type AnalyticsReportData,
	formatReportDate,
	getEventDateRangeLabel,
	getReportTypeLabel,
	type ReportMetadata,
} from "./types";

/**
 * Report Header
 * Standard corporate header layout
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
		<View style={styles.header} fixed>
			<View style={styles.headerTop}>
				<View>
					{/* EventzFlow Logo with Floating Nav Colors */}
					<Text style={{ fontSize: 24, fontFamily: "Times-Bold" }}>
						<Text style={{ color: colors.brandGreen }}>Event</Text>
						<Text style={{ color: colors.brandBlue }}>z</Text>
						<Text style={{ color: colors.brandGreen }}>Flow</Text>
					</Text>
				</View>
				<View style={{ alignItems: "flex-end" }}>
					<Text
						style={{
							fontSize: 12,
							fontFamily: "Helvetica-Bold",
							color: colors.textMain,
							textTransform: "uppercase",
						}}
					>
						{getReportTypeLabel(reportType)}
					</Text>
					<Text
						style={{ fontSize: 9, color: colors.textSecondary, marginTop: 4 }}
					>
						Generated on {formatReportDate(metadata.generatedAt)}
					</Text>
				</View>
			</View>

			<View>
				<Text style={styles.label}>Event Name</Text>
				<Text style={styles.h1}>{eventName}</Text>

				<View style={[styles.headerMeta, { marginTop: 8 }]}>
					<View>
						<Text style={styles.label}>Event Duration</Text>
						<Text style={styles.textSmall}>
							{getEventDateRangeLabel(
								metadata.eventStartDate,
								metadata.eventEndDate,
							)}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}

/**
 * Footer
 */
export function ReportFooter() {
	return (
		<View style={styles.footer} fixed>
			<Text style={{ fontSize: 8, color: colors.textMuted }}>
				Confidential & Proprietary - EventzFlow Analytics
			</Text>
			<Text
				style={{ fontSize: 8, color: colors.textMuted }}
				render={({ pageNumber, totalPages }) =>
					`Page ${pageNumber} of ${totalPages}`
				}
			/>
		</View>
	);
}

/**
 * Standard Section
 */
export function Section({
	title,
	children,
	breakOnPage = false,
}: {
	title: string;
	children: ReactNode;
	breakOnPage?: boolean;
}) {
	return (
		<View style={styles.mb4} break={breakOnPage}>
			<Text style={styles.h2} minPresenceAhead={60}>
				{title}
			</Text>
			{children}
		</View>
	);
}

/**
 * Stats Grid Container
 */
export function StatsGrid({ children }: { children: ReactNode }) {
	return <View style={styles.statsContainer}>{children}</View>;
}

/**
 * Individual Stat Item
 */
export function StatsCard({
	label,
	value,
	subtext,
	isLast = false,
}: {
	label: string;
	value: string | number;
	subtext?: string;
	isLast?: boolean;
}) {
	return (
		<View style={[styles.statItem, isLast ? styles.statItemLast : {}]}>
			<Text style={styles.label}>{label}</Text>
			<Text style={styles.value}>{value}</Text>
			{subtext && (
				<Text style={{ fontSize: 9, color: colors.success, marginTop: 4 }}>
					{subtext}
				</Text>
			)}
		</View>
	);
}

/**
 * Summary Box
 */
export function SummaryBox({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<View style={styles.summaryBox} wrap={false}>
			<Text style={styles.h3}>{title}</Text>
			{children}
		</View>
	);
}

/**
 * Standard Table
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
						key={`header-${index}`}
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
						style={[
							styles.tableRow,
							{
								backgroundColor:
									rowIndex % 2 === 0 ? colors.white : colors.background,
							},
						]}
						wrap={false}
					>
						{row.map((cell, cellIndex) => (
							<Text
								key={`cell-${cellIndex}`}
								style={[styles.tableCell, { width: columnWidths[cellIndex] }]}
							>
								{cell}
							</Text>
						))}
					</View>
				))
			) : (
				<View style={{ padding: 12, alignItems: "center" }}>
					<Text style={styles.textSmall}>
						No data available for this selection.
					</Text>
				</View>
			)}
		</View>
	);
}

/**
 * Progress Bar / Rate Indicator
 */
export function RateIndicator({
	label,
	rate,
	color = colors.brandSecondary,
}: {
	label: string;
	rate: number;
	color?: string;
}) {
	const clampedRate = Math.min(100, Math.max(0, rate));

	return (
		<View style={styles.mb4} wrap={false}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					marginBottom: 6,
				}}
			>
				<Text style={styles.textSmall}>{label}</Text>
				<Text style={[styles.textSmall, { fontFamily: "Helvetica-Bold" }]}>
					{rate.toFixed(1)}%
				</Text>
			</View>
			<View
				style={{ height: 6, backgroundColor: colors.border, width: "100%" }}
			>
				<View
					style={{
						height: "100%",
						width: `${clampedRate}%`,
						backgroundColor: color,
					}}
				/>
			</View>
		</View>
	);
}

/**
 * Bullet List
 */
export function BulletList({ items }: { items: string[] }) {
	return (
		<View style={{ gap: 6 }}>
			{items.map((item, index) => (
				<View key={`bullet-${index}`} style={{ flexDirection: "row" }}>
					<Text
						style={{ width: 12, fontSize: 10, color: colors.brandSecondary }}
					>
						•
					</Text>
					<Text style={[styles.text, { flex: 1 }]}>{item}</Text>
				</View>
			))}
		</View>
	);
}

/**
 * Layout Grid Row
 */
export function GridRow({ children }: { children: ReactNode }) {
	return <View style={styles.row}>{children}</View>;
}

/**
 * Layout Grid Column
 */
export function GridCol({
	children,
	width = "col6",
}: {
	children: ReactNode;
	width?: "col6" | "col4" | "col12";
}) {
	return <View style={styles[width]}>{children}</View>;
}
