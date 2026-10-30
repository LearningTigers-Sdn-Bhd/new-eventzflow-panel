"use client";

import { G, Line, Path, Svg, Text, View } from "@react-pdf/renderer";
import { colors } from "../styles";
import { calculateYTicks, formatYValue } from "./chart-utils";

export interface LineSeries {
	name: string;
	color: string;
	/** One value per label; null leaves a gap (nothing counted there yet). */
	values: (number | null)[];
}

interface LinesChartProps {
	labels: string[];
	series: LineSeries[];
	title?: string;
	subtitle?: string;
	height?: number;
}

const WIDTH = 480;
const PAD = { top: 20, bottom: 25, left: 35, right: 15 };

/** Several lines on one set of axes, e.g. one line per event day over the hours of the day. */
export function LinesChart({
	labels,
	series,
	title,
	subtitle,
	height = 170,
}: LinesChartProps) {
	const innerWidth = WIDTH - PAD.left - PAD.right;
	const innerHeight = height - PAD.top - PAD.bottom;
	const max = Math.max(
		1,
		...series.flatMap((s) => s.values.map((v) => v ?? 0)),
	);
	const yTicks = calculateYTicks(max, 5);
	const top = yTicks[yTicks.length - 1] || max;
	const x = (i: number) =>
		PAD.left +
		(labels.length <= 1
			? innerWidth / 2
			: (i / (labels.length - 1)) * innerWidth);
	const y = (value: number) =>
		PAD.top + innerHeight - (value / top) * innerHeight;
	// A null starts a new stroke, so a day still in progress just stops.
	const pathOf = (values: (number | null)[]) =>
		values.reduce<string>((d, v, i) => {
			if (v === null) return d;
			const move = i === 0 || values[i - 1] === null ? "M" : "L";
			return `${d}${move}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
		}, "");
	const labelEvery = Math.max(1, Math.ceil(labels.length / 12));

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
			<View
				style={{
					paddingHorizontal: 10,
					paddingVertical: 8,
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
					borderBottomStyle: "dashed",
				}}
			>
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
					<Text
						style={{ fontSize: 8, color: colors.textSecondary, marginTop: 2 }}
					>
						{subtitle}
					</Text>
				)}
				<View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
					{series.map((s) => (
						<View
							key={s.name}
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginRight: 12,
							}}
						>
							<View
								style={{
									width: 8,
									height: 8,
									backgroundColor: s.color,
									marginRight: 4,
								}}
							/>
							<Text style={{ fontSize: 8, color: colors.textSecondary }}>
								{s.name}
							</Text>
						</View>
					))}
				</View>
			</View>

			<View style={{ backgroundColor: colors.background, padding: 8 }}>
				<Svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`}>
					{yTicks.map((tick) => (
						<G key={tick}>
							<Line
								x1={PAD.left}
								y1={y(tick)}
								x2={PAD.left + innerWidth}
								y2={y(tick)}
								stroke={colors.border}
								strokeWidth={0.5}
								strokeOpacity={0.4}
							/>
							<Text
								x={PAD.left - 6}
								y={y(tick) + 3}
								style={{ fontSize: 7 }}
								fill={colors.textMuted}
								textAnchor="end"
							>
								{formatYValue(tick)}
							</Text>
						</G>
					))}
					{series.map((s) => (
						<Path
							key={s.name}
							d={pathOf(s.values)}
							fill="none"
							stroke={s.color}
							strokeWidth={1.5}
						/>
					))}
					{labels.map((label, i) =>
						i % labelEvery === 0 || i === labels.length - 1 ? (
							<Text
								key={label}
								x={x(i)}
								y={height - 6}
								style={{ fontSize: 7 }}
								fill={colors.textMuted}
								textAnchor="middle"
							>
								{label}
							</Text>
						) : null,
					)}
				</Svg>
			</View>
		</View>
	);
}
