"use client";

import { G, Line, Rect, Svg, Text, View } from "@react-pdf/renderer";
import { colors } from "../styles";

interface HourlyBarChartProps {
	data: { hour: string; value: number }[];
	dayLabel: string;
	barColor?: string;
	height?: number;
}

/**
 * Format hour to 12-hour format with AM/PM
 */
function formatHour(hourStr: string): string {
	const hour = parseInt(hourStr.split(":")[0], 10);
	if (hour === 0) return "12AM";
	if (hour === 12) return "12PM";
	if (hour < 12) return `${hour}AM`;
	return `${hour - 12}PM`;
}

/**
 * Hourly Bar Chart - Shows hourly breakdown for a single day
 */
export function HourlyBarChart({
	data,
	dayLabel,
	barColor = colors.brandSecondary,
	height = 120,
}: HourlyBarChartProps) {
	if (!data || data.length === 0) return null;

	const totalValue = data.reduce((sum, d) => sum + d.value, 0);

	const chartWidth = 500;
	const paddingTop = 20;
	const paddingBottom = 25;
	const paddingLeft = 35;
	const paddingRight = 15;

	const innerWidth = chartWidth - paddingLeft - paddingRight;
	const innerHeight = height - paddingTop - paddingBottom;

	const maxValue = Math.max(...data.map((d) => d.value), 1);
	const barWidth = Math.max((innerWidth / data.length) - 1, 3);
	const barGap = 1;

	// Show hour labels at intervals (every 3 hours: 12AM, 3AM, 6AM, etc.)
	const hourLabelInterval = 3;

	return (
		<View
			style={{
				backgroundColor: "#fafafa",
				borderWidth: 1,
				borderColor: "#e5e7eb",
				borderStyle: "dashed",
				borderRadius: 4,
				padding: 12,
				marginBottom: 10,
			}}
			wrap={false}
		>
			{/* Day label with total count */}
			<View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
				<Text
					style={{
						fontSize: 10,
						fontFamily: "Helvetica-Bold",
						color: colors.textMain,
					}}
				>
					{dayLabel}
				</Text>
				{totalValue > 0 && (
					<Text
						style={{
							fontSize: 9,
							color: colors.textMuted,
						}}
					>
						Total: {totalValue.toLocaleString()}
					</Text>
				)}
			</View>

			<Svg width={chartWidth} height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
				{/* Horizontal grid lines */}
				{[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
					const y = paddingTop + innerHeight * (1 - ratio);
					return (
						<Line
							key={`grid-${ratio}`}
							x1={paddingLeft}
							y1={y}
							x2={paddingLeft + innerWidth}
							y2={y}
							stroke="#e5e7eb"
							strokeWidth={0.5}
							strokeDasharray={ratio === 0 ? undefined : "2,2"}
						/>
					);
				})}

				{/* Y-axis labels */}
				<Text
					x={paddingLeft - 5}
					y={paddingTop + 3}
					style={{ fontSize: 7 }}
					fill={colors.textMuted}
					textAnchor="end"
				>
					{maxValue}
				</Text>
				<Text
					x={paddingLeft - 5}
					y={paddingTop + innerHeight / 2 + 2}
					style={{ fontSize: 7 }}
					fill={colors.textMuted}
					textAnchor="end"
				>
					{Math.round(maxValue / 2)}
				</Text>
				<Text
					x={paddingLeft - 5}
					y={paddingTop + innerHeight + 2}
					style={{ fontSize: 7 }}
					fill={colors.textMuted}
					textAnchor="end"
				>
					0
				</Text>

				{/* Bars */}
				{data.map((d, i) => {
					const barHeight = d.value > 0 ? Math.max((d.value / maxValue) * innerHeight, 2) : 0;
					const x = paddingLeft + (i * (innerWidth / data.length)) + barGap;
					const y = paddingTop + innerHeight - barHeight;

					return (
						<G key={`bar-${i}`}>
							{/* Bar */}
							{d.value > 0 && (
								<Rect
									x={x}
									y={y}
									width={barWidth}
									height={barHeight}
									fill={barColor}
									fillOpacity={0.85}
								/>
							)}
							{/* Value label - show for all bars with value > 0 */}
							{d.value > 0 && (
								<Text
									x={x + barWidth / 2}
									y={y - 4}
									style={{ fontSize: 6 }}
									fill={colors.textMain}
									textAnchor="middle"
								>
									{d.value}
								</Text>
							)}
						</G>
					);
				})}

				{/* X-axis hour labels */}
				{data.map((d, i) => {
					const hour = parseInt(d.hour.split(":")[0], 10);
					// Show label every 3 hours (0, 3, 6, 9, 12, 15, 18, 21)
					if (hour % hourLabelInterval !== 0) return null;
					const x = paddingLeft + (i * (innerWidth / data.length)) + barWidth / 2;
					return (
						<Text
							key={`hour-${i}`}
							x={x}
							y={height - 6}
							style={{ fontSize: 7 }}
							fill={colors.textMuted}
							textAnchor="middle"
						>
							{formatHour(d.hour)}
						</Text>
					);
				})}
			</Svg>
		</View>
	);
}

interface DailyHourlyBreakdownSectionProps {
	data: { date: string; hourlyData: { hour: string; value: number }[] }[];
	title?: string;
	barColor?: string;
}

/**
 * Daily Hourly Breakdown Section - Shows bar charts for each day's hourly activity
 */
export function DailyHourlyBreakdownSection({
	data,
	title,
	barColor = colors.brandSecondary,
}: DailyHourlyBreakdownSectionProps) {
	if (!data || data.length === 0) return null;

	const formatDayLabel = (dateStr: string, index: number) => {
		try {
			const date = new Date(dateStr);
			if (isNaN(date.getTime())) return `Day ${index + 1}`;
			return date.toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		} catch {
			return `Day ${index + 1}`;
		}
	};

	return (
		<View style={{ marginTop: 12 }}>
			{title && (
				<Text
					style={{
						fontSize: 10,
						fontFamily: "Helvetica-Bold",
						color: colors.textMain,
						marginBottom: 10,
					}}
				>
					{title}
				</Text>
			)}
			{data.map((day, index) => (
				<HourlyBarChart
					key={`day-${day.date}-${index}`}
					data={day.hourlyData}
					dayLabel={formatDayLabel(day.date, index)}
					barColor={barColor}
				/>
			))}
		</View>
	);
}
