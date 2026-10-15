"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { type ReportLanguage, reportLabels } from "@/lib/report-labels";
import { ReportFooter, ReportHeader } from "./components";
import { colors, styles } from "./styles";
import type { ReportEventInfo, ReportMetadata } from "./types";

const COLUMN_WIDTHS = ["8%", "40%", "32%", "20%"];
// Precomputed styles: name lists run to ~1,000+ rows, and the shared Table's
// per-cell style arrays made generation about twice as slow.
const cellStyles = COLUMN_WIDTHS.map((width) => ({ width, fontSize: 9 }));
const headCellStyles = COLUMN_WIDTHS.map((width) => ({
	width,
	fontSize: 8,
	fontFamily: "Helvetica-Bold",
	textTransform: "uppercase" as const,
}));
const rowBase = {
	flexDirection: "row" as const,
	paddingVertical: 4,
	paddingHorizontal: 12,
};
const rowStyles = [
	{ ...rowBase, backgroundColor: colors.white },
	{ ...rowBase, backgroundColor: colors.background },
];

function PeopleTable({
	headers,
	rows,
}: {
	headers: string[];
	rows: (string | number)[][];
}) {
	return (
		<View style={{ borderWidth: 1, borderColor: colors.border }}>
			<View style={{ ...rowBase, backgroundColor: colors.backgroundHeader }}>
				{headers.map((header, j) => (
					<Text key={header} style={headCellStyles[j]}>
						{header}
					</Text>
				))}
			</View>
			{rows.map((row, i) => (
				<View key={row[0]} style={rowStyles[i % 2]} wrap={false}>
					{row.map((cell, j) => (
						<Text key={COLUMN_WIDTHS[j]} style={cellStyles[j]}>
							{cell}
						</Text>
					))}
				</View>
			))}
		</View>
	);
}

export type AgencyNamesGroup = {
	value: string;
	count: number;
	quota?: number;
	people: { name: string; email: string | null; phone: string | null }[];
};

export type AgencyNamesSection = {
	/** Category this section belongs to, e.g. { label: "Kategori", value: "KERAJAAN…" }. */
	group?: { label: string; value: string };
	agencies: AgencyNamesGroup[];
};

interface AgencyNamesReportProps {
	event: ReportEventInfo;
	metadata: ReportMetadata;
	language: ReportLanguage;
	/** One per category; each after the first starts on a new page. */
	sections: AgencyNamesSection[];
}

// One block per agency (already in the organizer's display order), each with a
// numbered list of the people registered under it.
export function AgencyNamesReport({
	event,
	metadata,
	language,
	sections,
}: AgencyNamesReportProps) {
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
				<Text style={styles.h2}>{labels.nameList}</Text>

				{sections.map((section, sectionIndex) => (
					<View key={section.group?.value ?? "all"} break={sectionIndex > 0}>
						{section.group && (
							<View
								style={{
									borderLeftWidth: 3,
									borderLeftColor: colors.brandPrimary,
									backgroundColor: "#f4f4f5",
									paddingVertical: 6,
									paddingHorizontal: 10,
									marginBottom: 4,
								}}
							>
								<Text style={styles.label}>{section.group.label}</Text>
								<Text
									style={{
										fontSize: 13,
										fontFamily: "Helvetica-Bold",
										color: colors.textMain,
									}}
								>
									{section.group.value}
								</Text>
							</View>
						)}

						{section.agencies.map((agency, index) => (
							<View key={agency.value} style={{ marginTop: 12 }}>
								<Text style={styles.h3} minPresenceAhead={60}>
									{index + 1}. {agency.value}
								</Text>
								<Text style={[styles.textSmall, { marginBottom: 4 }]}>
									{agency.quota !== undefined
										? `${labels.quota}: ${agency.quota} · ${labels.registered}: ${agency.count}`
										: `${labels.count}: ${agency.count}`}
								</Text>
								{agency.people.length > 0 ? (
									<PeopleTable
										headers={[
											labels.billNo,
											labels.attendeeName,
											labels.email,
											labels.phone,
										]}
										rows={agency.people.map((p, i) => [
											i + 1,
											p.name,
											p.email ?? "-",
											p.phone ?? "-",
										])}
									/>
								) : (
									<Text style={styles.textSmall}>
										{labels.noRegistrationsYet}
									</Text>
								)}
							</View>
						))}
					</View>
				))}

				<ReportFooter />
			</Page>
		</Document>
	);
}
