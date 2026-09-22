"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { reportLabels } from "@/lib/report-labels";
import { ReportFooter, ReportHeader, Section, Table } from "./components";
import { styles } from "./styles";
import type { CustomReportData } from "./types";

interface CustomReportProps {
	data: CustomReportData;
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
							headers={[labels.billNo, ticketTypeBreakdown.label, labels.count]}
							rows={ticketTypeBreakdown.rows.map((row, index) => [
								index + 1,
								row.value,
								row.count,
							])}
							columnWidths={["10%", "70%", "20%"]}
							footer={[
								"",
								labels.total,
								ticketTypeBreakdown.rows.reduce(
									(sum, row) => sum + row.count,
									0,
								),
							]}
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
												headers={[
													labels.billNo,
													customFieldBreakdown.fieldLabel,
													labels.count,
												]}
												rows={group.rows.map((row, index) => [
													index + 1,
													row.value,
													row.count,
												])}
												columnWidths={["10%", "70%", "20%"]}
												footer={[
													"",
													labels.total,
													group.rows.reduce((sum, row) => sum + row.count, 0),
												]}
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
										headers={[
											labels.billNo,
											customFieldBreakdown.label,
											labels.count,
										]}
										rows={customFieldBreakdown.rows.map((row, index) => [
											index + 1,
											row.value,
											row.count,
										])}
										columnWidths={["10%", "70%", "20%"]}
										footer={[
											"",
											labels.total,
											customFieldBreakdown.rows.reduce(
												(sum, row) => sum + row.count,
												0,
											),
										]}
									/>
								</Section>
							))}

				<ReportFooter />
			</Page>
		</Document>
	);
}
