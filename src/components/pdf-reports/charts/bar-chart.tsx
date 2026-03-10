"use client";

import { Text, View } from "@react-pdf/renderer";
import { colors, styles } from "../styles";
import { formatDateLabel } from "./chart-utils";

interface BarChartProps {
	data: { date: string; value: number }[] | { period: string; value: number }[];
	title?: string;
	formatValue?: (value: number) => string;
	maxBars?: number;
	barColor?: string;
}

/**
 * Bar Chart - Clean Corporate (Horizontal bars)
 */
export function BarChart({
	data,
	title,
	formatValue,
	maxBars = 10,
	barColor = colors.brandSecondary,
}: BarChartProps) {
	const normalizedData = data.slice(0, maxBars).map((item) => ({
		label: "period" in item ? item.period : item.date,
		value: item.value,
	}));

	if (normalizedData.length === 0) return null;

	const maxValue = Math.max(...normalizedData.map((d) => d.value), 1);
	const barHeight = 16;
	const gap = 12;

	return (
		<View style={{ marginVertical: 8 }}>
			{title && <Text style={styles.h3}>{title}</Text>}

			{normalizedData.map((item, index) => {
				const percentage = (item.value / maxValue) * 100;
				const displayValue = formatValue
					? formatValue(item.value)
					: item.value.toLocaleString();

				return (
					<View key={`bar-${index}`} style={{ marginBottom: gap }}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginBottom: 4,
							}}
						>
							<Text style={{ fontSize: 9, color: colors.textSecondary }}>
								{formatDateLabel(item.label)}
							</Text>
							<Text
								style={{
									fontSize: 9,
									fontFamily: "Helvetica-Bold",
									color: colors.textMain,
								}}
							>
								{displayValue}
							</Text>
						</View>

						{/* Track */}
						<View
							style={{
								height: barHeight,
								width: "100%",
								backgroundColor: colors.background,
							}}
						>
							{/* Fill */}
							<View
								style={{
									width: `${Math.max(percentage, 1)}%`,
									height: "100%",
									backgroundColor: barColor,
								}}
							/>
						</View>
					</View>
				);
			})}
		</View>
	);
}
