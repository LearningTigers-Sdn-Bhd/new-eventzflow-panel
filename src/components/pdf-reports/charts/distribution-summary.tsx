"use client";

import { Text, View } from "@react-pdf/renderer";
import { colors, styles } from "../styles";

interface DistributionSummaryProps {
	items: { label: string; value: number; color?: string }[];
	title?: string;
}

/**
 * Distribution Summary - Shows percentage distribution with progress bars
 */
export function DistributionSummary({ items, title }: DistributionSummaryProps) {
	const total = items.reduce((sum, item) => sum + item.value, 0);

	return (
		<View style={{ marginVertical: 8 }}>
			{title && <Text style={styles.h3}>{title}</Text>}
			{items.map((item, index) => {
				const percentage = total > 0 ? (item.value / total) * 100 : 0;
				return (
					<View key={`dist-${index}`} style={{ marginBottom: 12 }} wrap={false}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginBottom: 4,
							}}
						>
							<Text
								style={{ fontSize: 9, color: colors.textMain, width: "70%" }}
							>
								{item.label}
							</Text>
							<Text
								style={{
									fontSize: 9,
									fontFamily: "Helvetica-Bold",
									color: colors.textMain,
								}}
							>
								{percentage.toFixed(1)}%
							</Text>
						</View>
						<View
							style={{
								height: 6,
								width: "100%",
								backgroundColor: colors.background,
							}}
						>
							<View
								style={{
									width: `${percentage}%`,
									height: "100%",
									backgroundColor: item.color || colors.brandPrimary,
								}}
							/>
						</View>
					</View>
				);
			})}
		</View>
	);
}
