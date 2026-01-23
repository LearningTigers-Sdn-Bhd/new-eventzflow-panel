"use client";

import { Svg, G, Path, Rect, Text, View, Circle } from "@react-pdf/renderer";
import { styles, colors } from "./styles";

/**
 * Donut Chart Component
 * Shows distribution between two values (e.g., scanned vs unscanned)
 */
export function DonutChart({
	value1,
	value2,
	label1,
	label2,
	color1 = colors.accent,
	color2 = colors.borderLight,
	size = 80,
}: {
	value1: number;
	value2: number;
	label1: string;
	label2: string;
	color1?: string;
	color2?: string;
	size?: number;
}) {
	const total = value1 + value2;
	const percentage1 = total > 0 ? (value1 / total) * 100 : 0;

	// Calculate arc paths
	const centerX = size / 2;
	const centerY = size / 2;
	const radius = size / 2 - 6;
	const innerRadius = radius * 0.55;

	// Convert percentage to radians (starting from top, going clockwise)
	const angle1 = (percentage1 / 100) * 360;

	// Create arc path for the first segment
	const createArc = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
		const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
		const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

		const x1 = centerX + outerR * Math.cos(startAngleRad);
		const y1 = centerY + outerR * Math.sin(startAngleRad);
		const x2 = centerX + outerR * Math.cos(endAngleRad);
		const y2 = centerY + outerR * Math.sin(endAngleRad);
		const x3 = centerX + innerR * Math.cos(endAngleRad);
		const y3 = centerY + innerR * Math.sin(endAngleRad);
		const x4 = centerX + innerR * Math.cos(startAngleRad);
		const y4 = centerY + innerR * Math.sin(startAngleRad);

		const largeArc = endAngle - startAngle > 180 ? 1 : 0;

		return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
	};

	return (
		<View style={{
			padding: 12,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.white,
			alignItems: "center",
		}}>
			<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				{/* Background circle (value2) */}
				{percentage1 < 100 && (
					<Path
						d={createArc(angle1, 360, radius, innerRadius)}
						fill={color2}
					/>
				)}
				{/* Foreground arc (value1) */}
				{percentage1 > 0 && percentage1 < 100 && (
					<Path
						d={createArc(0, angle1, radius, innerRadius)}
						fill={color1}
					/>
				)}
				{/* Full circle if 100% */}
				{percentage1 >= 100 && (
					<>
						<Circle cx={centerX} cy={centerY} r={radius} fill={color1} />
						<Circle cx={centerX} cy={centerY} r={innerRadius} fill={colors.white} />
					</>
				)}
				{/* Full empty circle if 0% */}
				{percentage1 === 0 && (
					<>
						<Circle cx={centerX} cy={centerY} r={radius} fill={color2} />
						<Circle cx={centerX} cy={centerY} r={innerRadius} fill={colors.white} />
					</>
				)}
				{/* Center percentage text */}
				<Text
					x={centerX}
					y={centerY + 4}
					style={{
						fontSize: 14,
						fontWeight: "bold",
						textAnchor: "middle",
					}}
					fill={colors.text}
				>
					{percentage1.toFixed(0)}%
				</Text>
			</Svg>
			{/* Legend */}
			<View style={{ marginTop: 8 }}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
					<View style={{ width: 6, height: 6, backgroundColor: color1 }} />
					<Text style={{ fontSize: 7, color: colors.textSecondary }}>
						{label1}: {value1.toLocaleString()}
					</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
					<View style={{ width: 6, height: 6, backgroundColor: color2 }} />
					<Text style={{ fontSize: 7, color: colors.textSecondary }}>
						{label2}: {value2.toLocaleString()}
					</Text>
				</View>
			</View>
		</View>
	);
}

/**
 * Horizontal Bar Chart Component
 * Shows daily/periodic data as horizontal bars
 * Designed to fit within A4 page width (515pt usable width with 48pt padding)
 */
export function BarChart({
	data,
	title,
	formatValue,
	maxBars = 10,
	barColor = colors.accent,
}: {
	data: { date: string; value: number }[] | { period: string; value: number }[];
	title?: string;
	formatValue?: (value: number) => string;
	maxBars?: number;
	barColor?: string;
}) {
	// Normalize data
	const normalizedData = data.slice(0, maxBars).map((item) => ({
		label: "period" in item ? item.period : item.date,
		value: item.value,
	}));

	if (normalizedData.length === 0) {
		return (
			<View style={{ padding: 16, alignItems: "center" }}>
				<Text style={{ fontSize: 9, color: colors.textMuted, fontStyle: "italic" }}>
					No data available
				</Text>
			</View>
		);
	}

	const maxValue = Math.max(...normalizedData.map((d) => d.value), 1);
	const barHeight = 14;
	const barGap = 4;

	return (
		<View style={{ marginVertical: 8 }}>
			{title && (
				<Text style={{ fontSize: 9, fontWeight: "bold", color: colors.text, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
					{title}
				</Text>
			)}
			{normalizedData.map((item, index) => {
				const percentage = (item.value / maxValue) * 100;
				return (
					<View
						key={`bar-${index}`}
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: barGap,
						}}
					>
						{/* Label - fixed width */}
						<Text
							style={{
								width: 50,
								fontSize: 7,
								color: colors.textSecondary,
								textAlign: "right",
								paddingRight: 6,
							}}
						>
							{formatDateLabel(item.label)}
						</Text>
						{/* Bar container - use percentage width */}
						<View
							style={{
								flex: 1,
								height: barHeight,
								backgroundColor: colors.borderLight,
								flexDirection: "row",
							}}
						>
							<View
								style={{
									width: `${Math.max(percentage, 1)}%`,
									height: barHeight,
									backgroundColor: barColor,
								}}
							/>
						</View>
						{/* Value - fixed width */}
						<Text
							style={{
								width: 60,
								fontSize: 8,
								fontWeight: "bold",
								color: colors.text,
								textAlign: "right",
								paddingLeft: 6,
							}}
						>
							{formatValue ? formatValue(item.value) : item.value.toLocaleString()}
						</Text>
					</View>
				);
			})}
			{data.length > maxBars && (
				<Text style={{ fontSize: 7, color: colors.textMuted, marginTop: 4, fontStyle: "italic" }}>
					Showing top {maxBars} of {data.length} entries
				</Text>
			)}
		</View>
	);
}

/**
 * Mini Sparkline Bar Chart (for inline display)
 */
export function SparklineBar({
	data,
	width = 200,
	height = 40,
	barColor = colors.accent,
}: {
	data: number[];
	width?: number;
	height?: number;
	barColor?: string;
}) {
	if (data.length === 0) return null;

	const maxValue = Math.max(...data, 1);
	const barWidth = Math.max(4, (width - data.length * 2) / data.length);
	const gap = 2;

	return (
		<Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
			{data.slice(0, 20).map((value, index) => {
				const barHeight = (value / maxValue) * (height - 4);
				const x = index * (barWidth + gap);
				const y = height - barHeight - 2;
				return (
					<Rect
						key={`spark-${index}`}
						x={x}
						y={y}
						width={barWidth}
						height={barHeight}
						fill={barColor}
					/>
				);
			})}
		</Svg>
	);
}

/**
 * Distribution Summary Component
 * Shows a visual breakdown with percentage bars
 */
export function DistributionSummary({
	items,
	title,
}: {
	items: { label: string; value: number; color?: string }[];
	title?: string;
}) {
	const total = items.reduce((sum, item) => sum + item.value, 0);

	return (
		<View style={{ marginVertical: 12 }}>
			{title && (
				<Text style={{ fontSize: 10, fontWeight: "bold", color: colors.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
					{title}
				</Text>
			)}
			{items.map((item, index) => {
				const percentage = total > 0 ? (item.value / total) * 100 : 0;
				return (
					<View key={`dist-${index}`} style={{ marginBottom: 8 }}>
						<View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
							<Text style={{ fontSize: 9, color: colors.text }}>{item.label}</Text>
							<Text style={{ fontSize: 9, color: colors.textSecondary }}>
								{item.value.toLocaleString()} ({percentage.toFixed(1)}%)
							</Text>
						</View>
						<View style={{ height: 6, backgroundColor: colors.borderLight }}>
							<View
								style={{
									width: `${percentage}%`,
									height: 6,
									backgroundColor: item.color || colors.accent,
								}}
							/>
						</View>
					</View>
				);
			})}
		</View>
	);
}

/**
 * Helper to format date labels for charts
 */
function formatDateLabel(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return dateStr;
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	} catch {
		return dateStr;
	}
}
