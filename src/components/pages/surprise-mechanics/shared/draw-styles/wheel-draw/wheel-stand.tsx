"use client";

import type React from "react";

/**
 * Wheel Stand Component
 */
export interface WheelStandProps {
	width?: number;
	height?: number;
	standColor?: string;
	baseColor?: string;
	className?: string;
}

export function WheelStand({
	width = 185,
	height = 80,
	standColor = "#FF7F50",
	baseColor = "#ffac63",
	className = "-mt-2 mx-auto",
}: WheelStandProps): React.JSX.Element {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 185 80"
			className={className}
			aria-label="Wheel stand"
		>
			<title>Wheel stand</title>
			{/* Polygon for the stand - tapers upward symmetrically */}
			<polygon
				className="origin-center scale-x-110 scale-y-130"
				points="15,90 170,90 142.5,0 42.5,0"
				fill={standColor}
			/>
			{/* Base rectangle - wide bottom */}
			<rect x="-2" y="65" width="185" height="20" fill={baseColor} />
		</svg>
	);
}
