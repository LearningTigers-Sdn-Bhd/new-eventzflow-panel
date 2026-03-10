"use client";

import { Path, Svg, Text, View } from "@react-pdf/renderer";
import { colors } from "../styles";

interface DonutChartProps {
	value1: number;
	value2: number;
	label1: string;
	label2: string;
	color1?: string;
	color2?: string;
	size?: number;
}

/**
 * Donut Chart - Professional Style
 */
export function DonutChart({
	value1,
	value2,
	label1,
	label2,
	color1 = colors.brandSecondary,
	color2 = colors.border,
	size = 140,
}: DonutChartProps) {
	const total = value1 + value2;
	const percentage1 = total > 0 ? (value1 / total) * 100 : 0;
	const percentage2 = total > 0 ? (value2 / total) * 100 : 0;

	// Dimensions
	const centerX = size / 2;
	const centerY = size / 2;
	const radius = size / 2;
	const innerRadius = radius * 0.7;

	// Angles
	const angle1 = (percentage1 / 100) * 360;

	const createArc = (
		startAngle: number,
		endAngle: number,
		outerR: number,
		innerR: number,
	) => {
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
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				width: "100%",
				paddingVertical: 12,
				paddingHorizontal: 24,
			}}
			wrap={false}
		>
			{/* Chart Section */}
			<View style={{ position: "relative" }}>
				<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
					{/* Background Ring */}
					<Path
						d={createArc(0, 359.9, radius, innerRadius)}
						fill={colors.backgroundHeader}
					/>
					{/* Unused Segment */}
					{percentage1 < 100 && (
						<Path
							d={createArc(angle1, 360, radius, innerRadius)}
							fill={color2}
						/>
					)}
					{/* Active Segment */}
					{percentage1 > 0 && (
						<Path d={createArc(0, angle1, radius, innerRadius)} fill={color1} />
					)}
				</Svg>
			</View>

			{/* Data Table Legend */}
			<View style={{ flex: 1, marginLeft: 48 }}>
				{/* Row 1 */}
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						borderBottomWidth: 1,
						borderBottomColor: colors.border,
						paddingBottom: 8,
						marginBottom: 12,
					}}
				>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<View
							style={{
								width: 14,
								height: 14,
								backgroundColor: color1,
								marginRight: 12,
								borderRadius: 2,
							}}
						/>
						<Text
							style={{
								fontSize: 10,
								color: colors.textSecondary,
								textTransform: "uppercase",
								letterSpacing: 0.5,
							}}
						>
							{label1}
						</Text>
					</View>
					<View style={{ alignItems: "flex-end" }}>
						<Text
							style={{
								fontSize: 14,
								fontFamily: "Helvetica-Bold",
								color: colors.textMain,
							}}
						>
							{value1.toLocaleString()}
						</Text>
						<Text style={{ fontSize: 9, color: colors.textSecondary }}>
							{percentage1.toFixed(1)}%
						</Text>
					</View>
				</View>

				{/* Row 2 */}
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						borderBottomWidth: 1,
						borderBottomColor: colors.border,
						paddingBottom: 8,
					}}
				>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<View
							style={{
								width: 14,
								height: 14,
								backgroundColor: color2,
								marginRight: 12,
								borderRadius: 2,
							}}
						/>
						<Text
							style={{
								fontSize: 10,
								color: colors.textSecondary,
								textTransform: "uppercase",
								letterSpacing: 0.5,
							}}
						>
							{label2}
						</Text>
					</View>
					<View style={{ alignItems: "flex-end" }}>
						<Text
							style={{
								fontSize: 14,
								fontFamily: "Helvetica-Bold",
								color: colors.textMain,
							}}
						>
							{value2.toLocaleString()}
						</Text>
						<Text style={{ fontSize: 9, color: colors.textSecondary }}>
							{percentage2.toFixed(1)}%
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
