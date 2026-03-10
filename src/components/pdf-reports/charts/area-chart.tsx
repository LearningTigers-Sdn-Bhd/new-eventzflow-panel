"use client";

import {
	Defs,
	G,
	Line,
	LinearGradient,
	Path,
	Stop,
	Svg,
	Text,
	View,
} from "@react-pdf/renderer";
import { colors } from "../styles";
import {
	calculateYTicks,
	createSmoothAreaPath,
	createSmoothPath,
	formatAxisDate,
	formatYValue,
} from "./chart-utils";

interface AreaChartProps {
	data: { date: string; value: number }[];
	title?: string;
	subtitle?: string;
	areaColor?: string;
	height?: number;
}

/**
 * Area Chart - Matches platform's TimeSeriesChart design
 * Card layout with icon, title, subtitle, and area chart with gradient
 */
export function AreaChart({
	data,
	title,
	subtitle,
	areaColor = colors.brandSecondary,
	height = 140,
}: AreaChartProps) {
	// Handle empty or insufficient data
	const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

	// Detect if data is hourly (format: "2026-01-14 14:00") or daily
	const isHourlyData = data.length > 0 && data[0]?.date?.includes(" ");

	const chartWidth = 480;
	const paddingTop = 25;
	const paddingBottom = 25;
	const paddingLeft = 35;
	const paddingRight = 15;

	const innerWidth = chartWidth - paddingLeft - paddingRight;
	const innerHeight = height - paddingTop - paddingBottom;

	// Prepare chart data
	const maxValue = hasData ? Math.max(...data.map((d) => d.value), 1) : 100;
	const yTicks = calculateYTicks(maxValue, 5);
	const adjustedMax = yTicks[yTicks.length - 1] || maxValue;

	// Calculate points for chart
	const points = hasData
		? data.map((d, i) => {
				const x =
					paddingLeft +
					(data.length === 1 ? innerWidth / 2 : (i / (data.length - 1)) * innerWidth);
				const y = paddingTop + innerHeight - (d.value / adjustedMax) * innerHeight;
				return { x, y, value: d.value, date: d.date };
			})
		: [];

	// Create paths - use monotone curve that doesn't overshoot
	const baselineY = paddingTop + innerHeight;
	const linePath = points.length >= 2 ? createSmoothPath(points, baselineY) : "";
	const areaPath =
		points.length >= 2 ? createSmoothAreaPath(points, baselineY) : "";

	// X-axis labels - show every hour for hourly data, reduce for daily
	const maxLabels = isHourlyData ? 24 : 10;
	const labelInterval = Math.max(1, Math.ceil(data.length / maxLabels));

	const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

	// Format function for x-axis based on data type
	const formatXLabel = (dateStr: string) => {
		if (isHourlyData) {
			const timePart = dateStr.split(" ")[1];
			if (timePart) {
				const [hourStr] = timePart.split(":");
				const hour = parseInt(hourStr, 10);
				if (hour === 0) return "12AM";
				if (hour === 12) return "12PM";
				if (hour < 12) return `${hour}AM`;
				return `${hour - 12}PM`;
			}
			return dateStr;
		}
		return formatAxisDate(dateStr);
	};

	return (
		<View
			style={{
				borderWidth: 1,
				borderColor: colors.border,
				borderStyle: "dashed",
				marginBottom: 16,
			}}
			wrap={false}
		>
			{/* Header */}
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
					borderBottomStyle: "dashed",
				}}
			>
				{/* Icon box */}
				<View
					style={{
						padding: 12,
						borderRightWidth: 1,
						borderRightColor: colors.border,
						borderRightStyle: "dashed",
					}}
				>
					<Svg width={16} height={16} viewBox="0 0 24 24">
						<Path
							d="M3 3v18h18"
							stroke={colors.textSecondary}
							strokeWidth={2}
							fill="none"
						/>
						<Path
							d="M7 14l4-4 4 4 5-6"
							stroke={colors.textSecondary}
							strokeWidth={2}
							fill="none"
						/>
					</Svg>
				</View>
				{/* Title and subtitle */}
				<View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
					{title && (
						<Text
							style={{
								fontSize: 10,
								fontFamily: "Helvetica-Bold",
								color: colors.textMain,
							}}
						>
							{title}
						</Text>
					)}
					{subtitle && (
						<Text style={{ fontSize: 8, color: colors.textSecondary, marginTop: 2 }}>
							{subtitle}
						</Text>
					)}
				</View>
			</View>

			{/* Chart area */}
			<View style={{ backgroundColor: colors.background, padding: 8 }}>
				{hasData && points.length >= 2 ? (
					<Svg width={chartWidth} height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
						{/* Gradient */}
						<Defs>
							<LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<Stop offset="5%" stopColor={areaColor} stopOpacity={0.7} />
								<Stop offset="95%" stopColor={areaColor} stopOpacity={0.1} />
							</LinearGradient>
						</Defs>

						{/* Horizontal grid lines */}
						{yTicks.map((tick, i) => {
							const y = paddingTop + innerHeight - (tick / adjustedMax) * innerHeight;
							return (
								<G key={`grid-${i}`}>
									<Line
										x1={paddingLeft}
										y1={y}
										x2={paddingLeft + innerWidth}
										y2={y}
										stroke={colors.border}
										strokeWidth={0.5}
										strokeOpacity={0.4}
									/>
									<Text
										x={paddingLeft - 6}
										y={y + 3}
										style={{ fontSize: 7 }}
										fill={colors.textMuted}
										textAnchor="end"
									>
										{formatYValue(tick)}
									</Text>
								</G>
							);
						})}

						{/* Area fill */}
						<Path d={areaPath} fill={`url(#${gradientId})`} />

						{/* Line */}
						<Path d={linePath} fill="none" stroke={areaColor} strokeWidth={1.5} />

						{/* Data point labels */}
						{points.map((point, i) => {
							const showLabel =
								data.length <= 7 ||
								i === 0 ||
								i === data.length - 1 ||
								i % labelInterval === 0 ||
								point.value === maxValue;
							if (!showLabel) return null;

							return (
								<Text
									key={`label-${i}`}
									x={point.x}
									y={point.y - 8}
									style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}
									fill={colors.textMain}
									textAnchor="middle"
								>
									{point.value.toLocaleString()}
								</Text>
							);
						})}

						{/* X-axis labels */}
						{data.map((d, i) => {
							if (i % labelInterval !== 0 && i !== data.length - 1) return null;
							const x =
								paddingLeft +
								(data.length === 1 ? innerWidth / 2 : (i / (data.length - 1)) * innerWidth);
							return (
								<Text
									key={`x-${i}`}
									x={x}
									y={height - 6}
									style={{ fontSize: 7 }}
									fill={colors.textMuted}
									textAnchor="middle"
								>
									{formatXLabel(d.date)}
								</Text>
							);
						})}
					</Svg>
				) : (
					<View
						style={{
							height: height,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Svg width={32} height={32} viewBox="0 0 24 24">
							<Path
								d="M3 3v18h18M7 14l4-4 4 4 5-6"
								stroke={colors.border}
								strokeWidth={2}
								fill="none"
							/>
						</Svg>
						<Text
							style={{
								fontSize: 9,
								color: colors.textMuted,
								marginTop: 8,
							}}
						>
							No data available for this period
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}
