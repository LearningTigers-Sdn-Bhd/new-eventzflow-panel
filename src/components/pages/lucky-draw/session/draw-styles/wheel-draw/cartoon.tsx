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
	onDraw,
	useGifts,
	hasAvailableGift,
}) => {
	// Cartoon theme: Fun, playful colors with better contrast
	const baseColors = useMemo(() => {
		return [
			"#FF3366", // Hot Pink
			"#FF9933", // Orange
			"#FFCC00", // Golden Yellow
			"#66CC33", // Lime Green
			"#33CCFF", // Sky Blue
			"#9966FF", // Purple
			"#FF6699", // Pink
			"#00CC99", // Teal
		];
	}, []);

	const {
		rotation,
		pointerRotation,
		pointerTransition,
		internalParticipants,
		arcs,
		arcGenerator,
		getSliceColor,
		svgRef,
		handleTransitionEnd,
		isEmpty,
		decorativeDots,
		pointerPosition,
		// Virtual mode features
		isVirtualMode,
		flashingName,
		participantCount,
	} = useWheel(
		{ participants, onDrawComplete, isDrawing },
		{
			baseColors,
			pointerAngle: 90,
			pointerVariant: "rounded",
			gapBetweenWheelAndOuter: 15,
			enableDecorativeDots: true,
			decorativeDotsCount: 16,
			decorativeDotsRadius: 265,
			decorativeDotsStartAngle: 0,
		},
	);

	const radius = 250;
	const width = 500;
	const height = 500;
	const viewBoxPadding = 40;

	if (isEmpty) {
		return (
			<div className="flex aspect-square w-full items-center justify-center rounded-full bg-gray-50 font-mono text-gray-400">
				Add participants
			</div>
		);
	}

	return (
		<div className="relative mx-auto flex w-full max-w-[500px] flex-col items-center justify-center">

			{/* The Wheel */}
			<div className="relative aspect-square w-full max-w-[500px]">
				{/* Static Cartoon Pointer - No animation */}
				<div
					{...pointerPosition}
				>
					<svg
						width="70"
						height="90"
						viewBox="0 0 70 90"
						className="drop-shadow-lg"
						aria-label="Wheel pointer"
						style={{
							transform: `rotate(${-180}deg)`, // Counter-rotate to keep arrow pointing down
						}}
					>
						{/* Shorter Pole */}
						<rect
							x="30"
							y="5"
							width="10"
							height="25"
							fill="#8B4513"
							stroke="#1a1a1a"
							strokeWidth="3"
						/>
						{/* Pole shine */}
						<rect
							x="32"
							y="5"
							width="3"
							height="25"
							fill="rgba(255,255,255,0.3)"
						/>

						{/* Arrow shadow - pointing DOWN */}
						<path
							d="M 35 80 L 55 30 L 35 35 L 15 30 Z"
							fill="rgba(0,0,0,0.2)"
							transform="translate(2, 2)"
						/>
					{/* Arrow body - Red - pointing DOWN */}
					<path
						d="M 35 80 L 55 30 L 35 35 L 15 30 Z"
						fill="#FF1744"
						stroke="#1a1a1a"
						strokeWidth="4"
						strokeLinejoin="round"
						className="dark:stroke-yellow-400"
					/>
						{/* Arrow shine */}
						<path
							d="M 35 80 L 43 52 L 35 35 L 27 52 Z"
							fill="rgba(255,255,255,0.5)"
						/>
						{/* Arrow outline detail */}
						<path
							d="M 35 80 L 55 30 L 35 35 L 15 30 Z"
							fill="none"
							stroke="#FFFFFF"
							strokeWidth="2"
							strokeLinejoin="round"
							opacity="0.3"
						/>
					</svg>
				</div>
				<svg
					ref={svgRef}
					viewBox={`${-viewBoxPadding} ${-viewBoxPadding} ${width + viewBoxPadding * 2} ${height + viewBoxPadding * 2}`}
					className="h-full w-full drop-shadow-2xl"
					aria-label="Spin wheel"
					style={{
						transform: `rotate(${rotation}deg)`,
						transition: isDrawing
							? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
							: "none",
					}}
					onTransitionEnd={handleTransitionEnd}
				>
					<title>Spin wheel</title>
					<defs>
						{/* Gradient for center hub shine */}
						<radialGradient id="hubShine" cx="30%" cy="30%">
							<stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
							<stop offset="100%" stopColor="rgba(255,255,255,0)" />
						</radialGradient>
					</defs>
					<g transform={`translate(${width / 2}, ${height / 2})`}>
						{/* Outer shadow for depth */}
						<circle r={radius + 12} fill="rgba(0,0,0,0.2)" />

						{/* Outer rim - thick border with gradient feel */}
						<circle r={radius + 10} fill="#FFA500" stroke="#1a1a1a" strokeWidth="6" />
						<circle r={radius + 5} fill="#FFD700" stroke="#1a1a1a" strokeWidth="3" />

						{/* Decorative studs around the rim - more playful */}
						{decorativeDots?.map((dot, idx) => (
							<g key={`stud-${dot.angle.toFixed(2)}`}>
								{/* Stud shadow */}
								<circle
									cx={dot.x + 1}
									cy={dot.y + 1}
									r="11"
									fill="rgba(0,0,0,0.3)"
								/>
								{/* Stud body - alternating colors */}
								<circle
									cx={dot.x}
									cy={dot.y}
									r="11"
									fill={idx % 2 === 0 ? "#FF3366" : "#33CCFF"}
									stroke="#1a1a1a"
									strokeWidth="3"
								/>
								{/* Stud shine */}
								<circle
									cx={dot.x - 3}
									cy={dot.y - 3}
									r="4"
									fill="rgba(255,255,255,0.8)"
								/>
							</g>
						))}

						{/* Inner rim border - double line for depth */}
						<circle r={radius - 13} fill="none" stroke="#1a1a1a" strokeWidth="5" />
						<circle r={radius - 18} fill="none" stroke="#FFD700" strokeWidth="2" />

						{/* Slices with thick black borders - In virtual mode, don't show names */}
						{arcs.map((d: d3.PieArcDatum<string>, i: number) => {
							const participant = !isVirtualMode
								? internalParticipants.find((p) => p.name === d.data)
								: null;
							return (
								<g key={isVirtualMode ? `segment-${i}` : (participant?.publicId || i)}>
									{/* Slice fill - clean and simple */}
									<path
										d={arcGenerator(d) || undefined}
										fill={getSliceColor(i)}
										stroke="#1a1a1a"
										strokeWidth="5"
										strokeLinejoin="round"
									/>

									{/* Text Labels - Comic style with stroke - Only show in non-virtual mode */}
									{!isVirtualMode && (
										<g transform={`translate(${arcGenerator.centroid(d)})`}>
											<g
												transform={`rotate(${(((d.startAngle + d.endAngle) / 2) * 180) / Math.PI})`}
											>
												{/* Text outline (stroke) */}
												<text
													transform={"rotate(-90)"}
													textAnchor="middle"
													dominantBaseline="middle"
													className="select-none font-black text-xs"
													style={{
														fontSize:
															internalParticipants.length > 12 ? "11px" : "16px",
														fill: "none",
														stroke: "#1a1a1a",
														strokeWidth: "4",
														strokeLinejoin: "round",
														paintOrder: "stroke",
													}}
												>
													{d.data.length > 15
														? `${d.data.substring(0, 12)}...`
														: d.data}
												</text>
												{/* Text fill (white) */}
												<text
													transform={"rotate(-90)"}
													textAnchor="middle"
													dominantBaseline="middle"
													className="select-none fill-white font-black text-xs"
													style={{
														fontSize:
															internalParticipants.length > 12 ? "11px" : "16px",
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

						{/* Center Hub - Minimalist and beautiful */}
						{/* Outer circle - White with shadow */}
						<circle r="45" fill="#FFFFFF" stroke="#1a1a1a" strokeWidth="5" />
						{/* Inner circle - Gradient effect */}
						<circle r="35" fill="#FFD700" stroke="#1a1a1a" strokeWidth="3" />
						{/* Center dot - Simple and clean */}
						<circle r="15" fill="#1a1a1a" />
					</g>
				</svg>

				{/* Flashing Name Overlay - Only in virtual mode during spin */}
				{isVirtualMode && flashingName && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="max-w-[70%] rounded-xl border-4 border-black bg-gradient-to-br from-yellow-400 to-orange-500 px-4 py-3 shadow-2xl">
							<p className="animate-pulse text-center font-black text-lg text-white drop-shadow-[2px_2px_0px_#000]">
								{flashingName}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Spin Button */}
			{onDraw && (
				<div className="mt-6 flex flex-col items-center gap-3">
					<button
						type="button"
						onClick={onDraw}
						disabled={isDrawing || isEmpty}
						className="rounded-lg border-4 border-black bg-gradient-to-b from-yellow-400 to-yellow-600 px-8 py-3 font-black text-red-900 text-xl uppercase tracking-wider shadow-[0_6px_0_0_#854d0e] transition-all hover:from-yellow-300 hover:to-yellow-500 active:translate-y-[4px] active:shadow-[0_2px_0_0_#854d0e] disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-600 disabled:text-gray-700 disabled:shadow-[0_6px_0_0_#4b5563]"
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

			{/* Participant Count Badge - Only show in virtual mode, placed below button to avoid arrow overlap */}
			{isVirtualMode && (
				<div className="mt-4 flex items-center gap-2 rounded-full border-4 border-black bg-gradient-to-r from-yellow-300 to-orange-300 px-4 py-2 shadow-lg">
					<span className="font-black text-gray-900 text-sm">Drawing from</span>
					<span className="rounded-full bg-red-500 px-3 py-1 font-black text-sm text-white shadow-md">
						{participantCount.toLocaleString()}
					</span>
					<span className="font-black text-gray-900 text-sm">participants</span>
				</div>
			)}
		</div>
	);
};

export default SpinWheel;
