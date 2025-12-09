"use client";

import type * as d3 from "d3";
import type React from "react";
import { useWheel } from "@/hooks/draw-styles/use-wheel";
import type { DrawProps } from "../type";

const SpinWheel: React.FC<DrawProps> = ({
	participants,
	onDrawComplete,
	isDrawing,
}) => {
	// Wireframe theme uses default colors from hook
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
	} = useWheel(
		{ participants, onDrawComplete, isDrawing },
		{ pointerVariant: "pointy" },
	);

	const radius = 250; // SVG coordinate system radius
	const width = 500;
	const height = 500;

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
					className="size-10 text-black"
					aria-label="Wheel pointer"
				/>
			</div>

			{/* The Wheel */}
			<div className="relative aspect-square w-full max-w-[500px]">
				<svg
					ref={svgRef}
					viewBox={`0 0 ${width} ${height}`}
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
						{/* Outer Rim */}
						<circle r={radius - 5} fill="none" stroke="black" strokeWidth="4" />

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
										stroke="black"
										strokeWidth="2"
									/>
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
								</g>
							);
						})}

						{/* Center Hub */}
						<circle r="15" fill="black" />
						<circle r="5" fill="white" />
					</g>
				</svg>
			</div>
		</div>
	);
};

export default SpinWheel;
