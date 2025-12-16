"use client";

import { useColorfulBox } from "@/hooks/draw-styles/use-colorful-box";
import type { DrawProps } from "../type";
import { WireframeGiftBox } from "./assets/wireframe-gift-box";

export function BoxDraw({
	participants,
	onDrawComplete,
	isDrawing,
	isCelebrating,
	onDraw,
}: DrawProps) {
	const { containerRef, isEmpty, isOpen, isAnimating } = useColorfulBox({
		participants,
		onDrawComplete,
		isDrawing,
		isCelebrating,
	});

	if (isEmpty) {
		return (
			<div className="flex h-96 items-center justify-center text-muted-foreground">
				No participants available
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="flex h-[600px] w-full flex-col items-center justify-center"
		>
			<WireframeGiftBox isOpen={isOpen} isAnimating={isAnimating} />
			
			<button
				type="button"
				onClick={onDraw}
				disabled={isDrawing}
				className="mt-12 px-10 py-4 text-xl font-bold tracking-[0.2em] uppercase 
						   bg-white border-2 border-slate-800 text-slate-800
						   shadow-[8px_8px_0px_0px_rgba(30,41,59,1)]
						   hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(30,41,59,1)]
						   active:translate-y-1 active:shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]
						   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
						   transition-all duration-200"
			>
				{isDrawing ? "OPENING..." : "OPEN BOX"}
			</button>
		</div>
	);
}
