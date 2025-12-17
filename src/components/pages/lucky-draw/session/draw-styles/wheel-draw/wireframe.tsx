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
	// Wireframe theme: Clean pastel colors
	const baseColors = useMemo(() => {
		return [
			"#FFB6C1", // Light Pink
			"#E6E6FA", // Lavender
			"#FFF4B1", // Light Yellow
			"#B4E7CE", // Mint
			"#C9D6FF", // Light Blue
			"#FFD4E5", // Blush Pink
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
		decorativeDots,
		// Virtual mode features
		isVirtualMode,
		flashingName,
		participantCount,
	} = useWheel(
		{ participants, onDrawComplete, isDrawing },
		{
			baseColors,
			pointerVariant: "pointy",
			gapBetweenWheelAndOuter: 8,
			enableDecorativeDots: true,
			decorativeDotsCount: 12,
			decorativeDotsRadius: 255,
			decorativeDotsStartAngle: 0,
		},
	);

	const radius = 250;
	const width = 500;
	const height = 500;
	const viewBoxPadding = 30;

	if (isEmpty) {
		return (
			<div className="flex aspect-square w-full items-center justify-center rounded-full bg-gray-50 font-mono text-gray-400">
				Add participants
			</div>
		);
	}

	return (
		<div className="relative mx-auto flex w-full max-w-[500px] flex-col items-center justify-center">

			{/* Static Pointer - pointing DOWN */}
			<div 
				className="pointer-events-none absolute -top-6 left-1/2 z-20"
				style={{
					left: "50%",
					transform: `translate(-50%, 0)`,
				}}
			>
				<svg
					width="60"
					height="80"
					viewBox="0 0 60 80"
					className="drop-shadow-md"
					aria-label="Wheel pointer"
				>
					{/* Simple arrow pointing down */}
					<path
						d="M 30 70 L 45 35 L 30 40 L 15 35 Z"
						fill="#1a1a1a"
						stroke="#1a1a1a"
						strokeWidth="2"
					/>
				</svg>
			</div>

			{/* The Wheel */}
			<div className="relative aspect-square w-full max-w-[500px]">
				<svg
					ref={svgRef}
					viewBox={`${-viewBoxPadding} ${-viewBoxPadding} ${width + viewBoxPadding * 2} ${height + viewBoxPadding * 2}`}
					className="h-full w-full drop-shadow-lg"
					aria-label="Spin wheel"
					style={{
						transform: `rotate(${rotation}deg)`,
						transition: isDrawing
							? "transform 6s cubic-bezier(0.15, 0.7, 0.1, 1)"
							: "none",
					}}
					onTransitionEnd={handleTransitionEnd}
				>
					<title>Spin wheel</title>
					<defs></defs>
					<g transform={`translate(${width / 2}, ${height / 2})`}>
						{/* Outer shadow */}
						<circle r={radius + 3} fill="rgba(0,0,0,0.1)" />
						
						{/* Outer rim - clean border */}
						<circle r={radius} fill="none" stroke="#2a2a2a" strokeWidth="3" />
						
						{/* Decorative dots */}
						{decorativeDots?.map((dot) => (
							<g key={`dot-${dot.angle.toFixed(2)}`}>
								<circle
									cx={dot.x}
									cy={dot.y}
									r="6"
									fill="#2a2a2a"
								/>
								<circle
									cx={dot.x}
									cy={dot.y}
									r="3"
									fill="#ffffff"
								/>
							</g>
						))}

						{/* Slices - In virtual mode, don't show names */}
						{arcs.map((d: d3.PieArcDatum<string>, i: number) => {
							const participant = !isVirtualMode 
								? internalParticipants.find((p) => p.name === d.data)
								: null;
							return (
								<g key={isVirtualMode ? `segment-${i}` : (participant?.publicId || i)}>
									{/* Slice fill */}
									<path
										d={arcGenerator(d) || undefined}
										fill={getSliceColor(i)}
										stroke="#2a2a2a"
										strokeWidth="2"
									/>
									{/* Text Labels - Only show in non-virtual mode */}
									{!isVirtualMode && (
										<g transform={`translate(${arcGenerator.centroid(d)})`}>
											<g
												transform={`rotate(${(((d.startAngle + d.endAngle) / 2) * 180) / Math.PI})`}
											>
												<text
													transform={"rotate(-90)"}
													textAnchor="middle"
													dominantBaseline="middle"
													className="select-none fill-gray-800 font-semibold text-xs"
													style={{
														fontSize:
															internalParticipants.length > 12 ? "11px" : "15px",
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

						{/* Center Hub - minimalist */}
						<circle r="30" fill="#ffffff" stroke="#2a2a2a" strokeWidth="3" />
						<circle r="18" fill="#2a2a2a" />
						<circle r="8" fill="#ffffff" />
					</g>
				</svg>
				
				{/* Flashing Name Overlay - Only in virtual mode during spin */}
				{isVirtualMode && flashingName && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="max-w-[70%] rounded-lg bg-black/80 px-4 py-3 shadow-2xl backdrop-blur-sm">
							<p className="animate-pulse text-center font-bold text-lg text-white">
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
						className="rounded-lg border-2 border-gray-800 bg-white px-8 py-3 font-bold text-lg uppercase tracking-wide text-gray-800 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg active:translate-y-[2px] active:shadow-sm disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-500"
					>
						{isDrawing ? "Spinning..." : "Spin"}
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
				<div className="mt-4 flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-4 py-2 shadow-sm">
					<span className="font-semibold text-gray-600 text-sm">Drawing from</span>
					<span className="rounded-full bg-gray-800 px-3 py-1 font-bold text-white text-sm">
						{participantCount.toLocaleString()}
					</span>
					<span className="font-semibold text-gray-600 text-sm">participants</span>
				</div>
			)}
		</div>
	);
};

export default SpinWheel;

