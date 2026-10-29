"use client";

import { Image, Text, View } from "@react-pdf/renderer";
import { colors, styles } from "./styles";

/** The top of both people counter reports: logo, report name, event, and what the report covers. */
export function PeopleCounterMasthead({
	eventTitle,
	subtitle,
	generatedAt,
}: {
	eventTitle: string;
	/** The day, or the date range for an all-days report. */
	subtitle: string;
	generatedAt: string;
}) {
	return (
		<View style={styles.header}>
			<View style={styles.headerTop}>
				<Image
					src="/logo/Logo.png"
					style={{ width: 120, height: 10, objectFit: "contain" }}
				/>
				<View style={{ alignItems: "flex-end" }}>
					<Text
						style={{
							fontSize: 12,
							fontFamily: "Helvetica-Bold",
							textTransform: "uppercase",
						}}
					>
						People counter report
					</Text>
					<Text
						style={{
							fontSize: 9,
							color: colors.textSecondary,
							marginTop: 4,
						}}
					>
						Generated {generatedAt}
					</Text>
				</View>
			</View>
			<Text style={styles.label}>Event</Text>
			<Text style={styles.h1}>{eventTitle}</Text>
			<Text style={styles.textSmall}>{subtitle}</Text>
		</View>
	);
}
