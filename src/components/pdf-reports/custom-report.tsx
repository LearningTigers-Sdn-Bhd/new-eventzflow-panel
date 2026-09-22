"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { reportLabels } from "@/lib/report-labels";
import { ReportFooter, ReportHeader, Section, Table } from "./components";
import { styles } from "./styles";
import type { CustomReportData, ReportBreakdown } from "./types";

interface CustomReportProps {
	data: CustomReportData;
}

// Builds Table props for a breakdown row set. When any row has a quota
// configured, adds Quota / Registered / Remaining columns (mirroring the
// in-app breakdown table); otherwise falls back to the plain Bil/label/Count
// layout used everywhere else in the report.
function buildBreakdownTable(
	rows: ReportBreakdown["rows"],
	labelHeader: string,
	labels: (typeof reportLabels)["en"],
): {
	headers: string[];
	rows: (string | number)[][];
	columnWidths: string[];
	columnAligns?: ("left" | "right")[];
	footer: (string | number)[];
} {
	const hasAnyQuota = rows.some((row) => row.quota !== undefined);
	const totalCount = rows.reduce((sum, row) => sum + row.count, 0);

	if (!hasAnyQuota) {
		return {
			headers: [labels.billNo, labelHeader, labels.count],
			rows: rows.map((row, index) => [index + 1, row.value, row.count]),
			columnWidths: ["8%", "72%", "20%"],
			footer: ["", labels.total, totalCount],
		};
	}

	return {
		headers: [
			labels.billNo,
			labelHeader,
			labels.quota,
			labels.registered,
			labels.remaining,
		],
		rows: rows.map((row, index) => [
			index + 1,
			row.value,
			row.quota?.toLocaleString() ?? "-",
			row.quota !== undefined
				? `${row.count.toLocaleString()} (${Math.round((row.count / row.quota) * 100)}%)`
				: row.count.toLocaleString(),
			row.quota !== undefined
				? `${(row.remaining ?? 0).toLocaleString()} (${Math.round(((row.remaining ?? 0) / row.quota) * 100)}%)`
				: "-",
		]),
		columnWidths: ["6%", "38%", "14%", "21%", "21%"],
		columnAligns: ["left", "left", "right", "right", "right"],
		footer: ["", labels.total, "", totalCount, ""],
	};
}

export function CustomReport({ data }: CustomReportProps) {
	const {
		event,
		metadata,
		ticketTypeBreakdown,
		customFieldBreakdown,
		language = "en",
	} = data;
	const labels = reportLabels[language];

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<ReportHeader
					eventName={event.name}
					reportType="custom"
					metadata={metadata}
					language={language}
				/>

				{ticketTypeBreakdown && ticketTypeBreakdown.rows.length > 0 && (
					<Section title={`${ticketTypeBreakdown.label} ${labels.breakdown}`}>
						<Table
							{...buildBreakdownTable(
								ticketTypeBreakdown.rows,
								ticketTypeBreakdown.label,
								labels,
							)}
						/>
					</Section>
				)}

				{customFieldBreakdown &&
					("groups" in customFieldBreakdown
						? customFieldBreakdown.groups.length > 0 && (
								<Section
									title={`${customFieldBreakdown.fieldLabel} ${labels.breakdown} (${labels.by} ${customFieldBreakdown.groupLabel})`}
								>
									{customFieldBreakdown.groups.map((group, groupIndex) => (
										<View
											key={group.group}
											style={{ marginBottom: 12 }}
											break={groupIndex > 0}
										>
											<Text style={styles.h3}>{group.group}</Text>
											<Table
												{...buildBreakdownTable(
													group.rows,
													customFieldBreakdown.fieldLabel,
													labels,
												)}
											/>
										</View>
									))}
								</Section>
							)
						: customFieldBreakdown.rows.length > 0 && (
								<Section
									title={`${customFieldBreakdown.label} ${labels.breakdown}`}
								>
									<Table
										{...buildBreakdownTable(
											customFieldBreakdown.rows,
											customFieldBreakdown.label,
											labels,
										)}
									/>
								</Section>
							))}

				<ReportFooter />
			</Page>
		</Document>
	);
}
