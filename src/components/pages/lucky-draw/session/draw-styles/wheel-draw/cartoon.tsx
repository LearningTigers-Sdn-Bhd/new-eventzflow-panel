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
	} = useWheel(
		{ participants, onDrawComplete, isDrawing },
		{
			baseColors,
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
			{/* Static Cartoon Pointer - No animation */}
			<div 
				className="pointer-events-none absolute -top-6 left-1/2 z-20"
				style={{
					left: "50%",
					transform: `translate(-50%, 0)`,
				}}
			>
				<svg
					width="70"
					height="90"
					viewBox="0 0 70 90"
					className="drop-shadow-lg"
					aria-label="Wheel pointer"
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

			{/* The Wheel */}
			<div className="relative aspect-square w-full max-w-[500px]">
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

						{/* Slices with thick black borders */}
						{arcs.map((d: d3.PieArcDatum<string>, i: number) => {
							const participant = internalParticipants.find(
								(p) => p.name === d.data,
							);
							return (
								<g key={participant?.publicId || i}>
									{/* Slice fill - clean and simple */}
									<path
										d={arcGenerator(d) || undefined}
										fill={getSliceColor(i)}
										stroke="#1a1a1a"
										strokeWidth="5"
										strokeLinejoin="round"
									/>

									{/* Text Labels - Comic style with stroke */}
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
			</div>

			{/* Spin Button */}
			{onDraw && (
				<button
					type="button"
					onClick={onDraw}
					disabled={isDrawing || isEmpty}
					className="mt-6 rounded-lg border-4 border-black bg-gradient-to-b from-yellow-400 to-yellow-600 px-8 py-3 font-black text-xl uppercase tracking-wider text-red-900 shadow-[0_6px_0_0_#854d0e] transition-all hover:from-yellow-300 hover:to-yellow-500 active:translate-y-[4px] active:shadow-[0_2px_0_0_#854d0e] disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-600 disabled:text-gray-700 disabled:shadow-[0_6px_0_0_#4b5563]"
				>
					{isDrawing ? "SPINNING..." : "SPIN!"}
				</button>
			)}
		</div>
	);
};

export default SpinWheel;
