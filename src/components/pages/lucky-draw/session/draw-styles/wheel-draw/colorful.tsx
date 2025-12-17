"use client";

import type * as d3 from "d3";
import type React from "react";
import { useMemo } from "react";
import { useWheel } from "@/hooks/draw-styles/use-wheel";
import type { DrawProps } from "../type";
import { WheelStand } from "./wheel-stand";

const SpinWheel: React.FC<DrawProps> = ({
	participants,
	onDrawComplete,
	isDrawing,
	onDraw,
	useGifts,
	hasAvailableGift,
}) => {
	// Colorful theme: Vibrant 10-color palette
	const baseColors = useMemo(() => {
		return [
			"#FF4444", // Red
			"#FF8C42", // Orange
			"#FFD93D", // Yellow
			"#6BCF7F", // Lime green
			"#4ECDC4", // Teal
			"#45B7D1", // Light blue
			"#5B7FFF", // Blue
			"#9D4EDD", // Purple
			"#FF6B9D", // Pink
		];
	}, []);

	const radius = 250; // SVG coordinate system radius
	const width = 500;
	const height = 500;
	// Calculate border ring dimensions
	const innerRadius = radius - 1; // 249
	const outerRadius = radius - 1 + 25; // 274
	const ringCenterRadius = (innerRadius + outerRadius) / 2; // Center of the ring: 261.5

	// Calculate dot positions for viewBox sizing
	const dotRadius = ringCenterRadius; // Dots centered in the ring
	const dotOuterRadius = dotRadius + 8; // 269.5 (dot radius 8)
	// ViewBox needs to accommodate the full wheel including border and dots
	const viewBoxPadding = Math.ceil(dotOuterRadius - radius) + 10; // Extra padding for safety

	const {
		rotation,
		internalParticipants,
		arcs,
		arcGenerator,
		getSliceColor,
		svgRef,
		handleTransitionEnd,
		isEmpty,
		// Optional rendering features
		innerShadowArcGenerator,
		borderRingGenerator,
		borderRingData,
		decorativeDots,
		pointerPosition,
		pointerIcon: PointerIcon,
		// Virtual mode features
		isVirtualMode,
		flashingName,
		participantCount,
	} = useWheel(
		{ participants, onDrawComplete, isDrawing },
		{
			baseColors,
			pointerAngle: 90, // Pointer at 3 o'clock
			pointerVariant: "rounded",
			gapBetweenWheelAndOuter: 1,
			// Enable optional features
			enableInnerShadow: true,
			innerShadowDepth: 10,
			innerShadowOffset: -1,
			enableBorderRing: true,
			borderRingInnerRadius: innerRadius,
			borderRingOuterRadius: outerRadius,
			enableDecorativeDots: true,
			decorativeDotsCount: 22,
			decorativeDotsRadius: dotRadius,
			decorativeDotsStartAngle: -90,
		},
	);

	if (isEmpty) {
		return (
			<div className="flex aspect-square w-full items-center justify-center rounded-full bg-gray-50 font-mono text-gray-400">
				Add participants
			</div>
		);
	}

	return (
		<div className="relative mx-auto flex w-full max-w-[450px] flex-col items-center justify-center">

			{/* The Wheel */}
			<div className="relative aspect-square w-full max-w-[600px]">
				{/* Pointer - always rendered inside wheel container */}
				<div {...pointerPosition}>
					<PointerIcon
						className="size-10 text-yellow-400 drop-shadow-xl"
						aria-label="Wheel pointer"
						style={{
							fill: "currentColor",
						}}
					/>
				</div>
				<svg
					ref={svgRef}
					viewBox={`${-viewBoxPadding} ${-viewBoxPadding} ${width + viewBoxPadding * 2} ${height + viewBoxPadding * 2}`}
					className="h-full w-full drop-shadow-xl"
					aria-label="Spin wheel"
					style={{
						transform: `rotate(${rotation}deg)`,
						transition: isDrawing
							? "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)"
							: "none",
					}}
					onTransitionEnd={handleTransitionEnd}
				>
					<title>Spin wheel</title>
					<g transform={`translate(${width / 2}, ${height / 2})`}>
						{/* Outer Rim - Layered circles */}
						{/* Outer stroke circle */}
						<circle
							r={radius - 1 + 25}
							fill="none"
							stroke="#ffac63"
							strokeWidth="8"
						/>
						{/* Yellow background ring (only fills border area) */}
						{borderRingGenerator && borderRingData && (
							<path
								d={borderRingGenerator(borderRingData) || undefined}
								fill="#FF8C42"
							/>
						)}
						{/* Inner stroke circle (creates border edge) */}
						<circle
							r={radius - 1}
							fill="none"
							stroke="#FF8C42"
							strokeWidth="4"
						/>
						{/* Decorative Dots - on top of yellow background, centered in ring */}
						{decorativeDots?.map((dot) => (
							<circle
								key={`decorative-dot-${dot.angle.toFixed(2)}`}
								cx={dot.x}
								cy={dot.y}
								r="8"
								fill="white"
							/>
						))}

						{/* Slices - In virtual mode, don't show names */}
						{arcs.map((d: d3.PieArcDatum<string>, i: number) => {
							// Find the participant for this arc to use as key
							const participant = !isVirtualMode
								? internalParticipants.find((p) => p.name === d.data)
								: null;
							return (
								<g key={isVirtualMode ? `segment-${i}` : (participant?.publicId || i)}>
									<path
										d={arcGenerator(d) || undefined}
										fill={getSliceColor(i)}
									/>
									{/* Inner Shadow - creates depth at outer edge of slice */}
									{innerShadowArcGenerator && (
										<path
											d={innerShadowArcGenerator(d) || undefined}
											fill="rgba(0, 0, 0, 0.15)"
										/>
									)}
									{/* Text Labels - Only show in non-virtual mode */}
									{!isVirtualMode && (
										<g transform={`translate(${arcGenerator.centroid(d)})`}>
											<g
												transform={`rotate(${(((d.startAngle + d.endAngle) / 2) * 180) / Math.PI})`}
											>
												{/* Rotate text to align with wedge center angle, then adjust for readability */}
												<text
													transform={"rotate(-90)"} // Orient text outwards
													textAnchor="middle"
													dominantBaseline="middle"
													className="select-none fill-black font-semibold text-xs"
													style={{
														fontSize:
															internalParticipants.length > 12 ? "10px" : "14px",
													}}
												>
													{d.data.length > 15
														? `${d.data.substring(0, 12)}...`
														: d.data}
												</text>
											</g>
										</g>
									)}
								</g>
							);
						})}

						{/* Center Hub */}
						<circle r="48" fill="#FF7F50" />
						<circle r="40" fill="#ffac63" />
					</g>
				</svg>
				
				{/* Flashing Name Overlay - Only in virtual mode during spin */}
				{isVirtualMode && flashingName && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="max-w-[70%] rounded-xl bg-gradient-to-br from-orange-600 to-red-600 px-4 py-3 shadow-2xl">
							<p className="animate-pulse text-center font-bold text-lg text-white drop-shadow-lg">
								{flashingName}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Stand */}
			<WheelStand standColor="#FF7F50" baseColor="#ffac63" />

			{/* Participant Count Badge - Only show in virtual mode, placed below stand to avoid arrow overlap */}
			{isVirtualMode && (
				<div className="mt-2 flex items-center gap-2 rounded-full border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 px-4 py-2 shadow-sm">
					<span className="font-semibold text-orange-700 text-sm">Drawing from</span>
					<span className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 font-bold text-white text-sm shadow-sm">
						{participantCount.toLocaleString()}
					</span>
					<span className="font-semibold text-orange-700 text-sm">participants</span>
				</div>
			)}

			{/* Spin Button */}
			{onDraw && (
				<div className="mt-4 flex flex-col items-center gap-3">
					<button
						type="button"
						onClick={onDraw}
						disabled={isDrawing || isEmpty}
						className="rounded-xl border-4 border-orange-700 bg-gradient-to-b from-orange-400 to-orange-600 px-10 py-3 font-black text-xl uppercase tracking-wider text-white shadow-[0_6px_0_0_#c2410c] transition-all hover:from-orange-300 hover:to-orange-500 active:translate-y-[4px] active:shadow-[0_2px_0_0_#c2410c] disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-600 disabled:border-gray-700 disabled:text-gray-300 disabled:shadow-[0_6px_0_0_#4b5563]"
					>
						{isDrawing ? "SPINNING..." : "SPIN!"}
					</button>
					{useGifts && !hasAvailableGift && (
						<div className="rounded-lg border-2 border-orange-400 bg-orange-50 px-4 py-2 text-center text-orange-800 text-sm">
							⚠️ Please add gifts before drawing
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SpinWheel;

