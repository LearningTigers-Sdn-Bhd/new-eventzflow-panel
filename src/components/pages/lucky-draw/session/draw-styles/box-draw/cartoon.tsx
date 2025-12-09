"use client";

import { useBox } from "@/hooks/draw-styles/use-box";
import type { DrawProps } from "../type";

export function BoxDraw({
	participants,
	onDrawComplete,
	isDrawing,
}: DrawProps) {
	const { boxRef, containerRef, isEmpty } = useBox({
		participants,
		onDrawComplete,
		isDrawing,
	});

	if (isEmpty) {
		return (
			<div className="flex h-96 items-center justify-center text-muted-foreground">
				No participants available
			</div>
		);
	}

	// Cartoon theme: Material UI vibrant colors
	const borderColor = "#2196F3"; // blue-500
	const bgColor1 = "#E3F2FD"; // blue-50
	const bgColor2 = "#BBDEFB"; // blue-100
	const bgColor3 = "#90CAF9"; // blue-200
	const textColor = "#9C27B0"; // purple-500

	return (
		<div ref={containerRef} className="relative h-96 w-full">
			{/* Box container */}
			<div className="relative flex h-full w-full items-center justify-center">
				<div className="relative" style={{ perspective: "1000px" }}>
					{/* Box base */}
					<div
						ref={boxRef}
						className="relative"
						style={{
							width: "200px",
							height: "200px",
							transformStyle: "preserve-3d",
						}}
					>
						{/* Box front */}
						<div
							className="absolute border-4"
							style={{
								width: "200px",
								height: "200px",
								transform: "translateZ(100px)",
								borderColor: borderColor,
								backgroundColor: bgColor1,
							}}
						/>
						{/* Box back */}
						<div
							className="absolute border-4"
							style={{
								width: "200px",
								height: "200px",
								transform: "translateZ(-100px) rotateY(180deg)",
								borderColor: borderColor,
								backgroundColor: bgColor1,
							}}
						/>
						{/* Box right */}
						<div
							className="absolute border-4"
							style={{
								width: "200px",
								height: "200px",
								transform: "rotateY(90deg) translateZ(100px)",
								borderColor: borderColor,
								backgroundColor: bgColor2,
							}}
						/>
						{/* Box left */}
						<div
							className="absolute border-4"
							style={{
								width: "200px",
								height: "200px",
								transform: "rotateY(-90deg) translateZ(100px)",
								borderColor: borderColor,
								backgroundColor: bgColor2,
							}}
						/>
						{/* Box top (lid) - Fixed now */}
						<div
							className="absolute border-4"
							style={{
								width: "200px",
								height: "200px",
								transform: "rotateX(90deg) translateZ(100px)",
								transformOrigin: "bottom center",
								borderColor: borderColor,
								backgroundColor: bgColor3,
							}}
						/>
						{/* Box bottom */}
						<div
							className="absolute border-4"
							style={{
								width: "200px",
								height: "200px",
								transform: "rotateX(-90deg) translateZ(100px)",
								borderColor: borderColor,
								backgroundColor: bgColor1,
							}}
						/>

						{/* Question Mark on Front */}
						<div
							className="absolute flex items-center justify-center font-bold text-6xl"
							style={{
								width: "200px",
								height: "200px",
								transform: "translateZ(100px)",
								color: textColor,
							}}
						>
							?
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
