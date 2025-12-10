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
							className="absolute border-4 border-primary bg-primary/10"
							style={{
								width: "200px",
								height: "200px",
								transform: "translateZ(100px)",
							}}
						/>
						{/* Box back */}
						<div
							className="absolute border-4 border-primary bg-primary/10"
							style={{
								width: "200px",
								height: "200px",
								transform: "translateZ(-100px) rotateY(180deg)",
							}}
						/>
						{/* Box right */}
						<div
							className="absolute border-4 border-primary bg-primary/20"
							style={{
								width: "200px",
								height: "200px",
								transform: "rotateY(90deg) translateZ(100px)",
							}}
						/>
						{/* Box left */}
						<div
							className="absolute border-4 border-primary bg-primary/20"
							style={{
								width: "200px",
								height: "200px",
								transform: "rotateY(-90deg) translateZ(100px)",
							}}
						/>
						{/* Box top (lid) - Fixed now */}
						<div
							className="absolute border-4 border-primary bg-primary/30"
							style={{
								width: "200px",
								height: "200px",
								transform: "rotateX(90deg) translateZ(100px)",
								transformOrigin: "bottom center",
							}}
						/>
						{/* Box bottom */}
						<div
							className="absolute border-4 border-primary bg-primary/10"
							style={{
								width: "200px",
								height: "200px",
								transform: "rotateX(-90deg) translateZ(100px)",
							}}
						/>

						{/* Question Mark on Front */}
						<div
							className="absolute flex items-center justify-center font-bold text-6xl text-primary"
							style={{
								width: "200px",
								height: "200px",
								transform: "translateZ(100px)",
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
