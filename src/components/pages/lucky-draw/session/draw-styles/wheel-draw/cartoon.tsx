"use client";

import type * as d3 from "d3";
import type React from "react";
import { useMemo } from "react";
import { useWheel } from "@/hooks/draw-styles/use-wheel";
import type { DrawProps } from "../type";

const SpinWheel: React.FC<DrawProps> = ({
	participants,
	onDrawComplete,
	isDrawing,
}) => {
	// Cartoon theme: Vibrant 12-color rainbow spectrum matching image
	const baseColors = useMemo(() => {
		return [
			"#9D4EDD", // Purple
			"#C77DFF", // Dark Pink
			"#FF006E", // Red
			"#FF8C42", // Orange
			"#FFD93D", // Yellow
			"#90EE90", // Light Green
			"#06FFA5", // Green
			"#4ECDC4", // Light Blue
			"#00B4D8", // Blue
			"#1E40AF", // Dark Blue
			"#5A67D8", // Indigo/Violet
			"#7B2CBF", // Purple (another shade)
		];
	}, []);

	const {
		rotation,
		internalParticipants,
		arcs,
		arcGenerator,
		getSliceColor,
		svgRef,
		handleTransitionEnd,
		isEmpty,
		pointerPosition,
		pointerIcon: PointerIcon,
		innerShadowArcGenerator,
	} = useWheel(
		{ participants, onDrawComplete, isDrawing },
		{
			baseColors,
			pointerVariant: "rounded",
			gapBetweenWheelAndOuter: -5,
			enableInnerShadow: true,
			innerShadowDepth: 10,
			innerShadowOffset: -1,
		},
	);

	const radius = 250; // SVG coordinate system radius
	const width = 500;
	const height = 500;
	// Calculate rim dimensions similar to colorful theme
	const innerRadius = radius - 1 + 14; // 249
	const outerRadius = radius - 2 + 27; // 264 (smaller than colorful's 25 for cartoon style)
	// ViewBox needs to accommodate the larger outer rim
	const viewBoxPadding = Math.ceil(outerRadius - radius) + 10; // Extra padding for safety

	if (isEmpty) {
		return (
			<div className="flex aspect-square w-full items-center justify-center rounded-full border-2 border-black border-dashed bg-gray-50 font-mono text-gray-400">
				Add participants
			</div>
		);
	}

	return (
		<div className="relative mx-auto flex w-full max-w-[500px] flex-col items-center justify-center">
			{/* Pointer */}
			<div {...pointerPosition}>
				<PointerIcon
					className="size-10 text-yellow-500"
					aria-label="Wheel pointer"
				/>
			</div>

			{/* The Wheel */}
			<div className="relative aspect-square w-full max-w-[500px]">
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
						{/* Outer Rim - Layered design similar to colorful theme */}
						{/* Outer stroke circle: Dark blue, thick */}
						<circle
							r={outerRadius}
							fill="none"
							stroke="#011d38"
							strokeWidth="6"
						/>
						{/* Inner stroke circle: White, thin */}
						<circle
							r={innerRadius}
							fill="none"
							stroke="#23475f"
							strokeWidth="20"
						/>

						{/* Slices */}
						{arcs.map((d: d3.PieArcDatum<string>, i: number) => {
							// Find the participant for this arc to use as key
							const participant = internalParticipants.find(
								(p) => p.name === d.data,
							);
							return (
								<g key={participant?.publicId || i}>
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
									{/* Text Labels */}
									<g transform={`translate(${arcGenerator.centroid(d)})`}>
										<g
											transform={`rotate(${(((d.startAngle + d.endAngle) / 2) * 180) / Math.PI})`}
										>
											{/* Rotate text to align with wedge center angle, then adjust for readability */}
											<text
												transform={"rotate(-90)"} // Orient text outwards
												textAnchor="middle"
												dominantBaseline="middle"
												className="select-none fill-white font-semibold text-xs"
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
								</g>
							);
						})}

						{/* Center Hub */}
						<circle r="25" fill="#23475f" />
						<circle r="12" fill="#011d38" />
					</g>
				</svg>
			</div>
		</div>
	);
};

export default SpinWheel;
