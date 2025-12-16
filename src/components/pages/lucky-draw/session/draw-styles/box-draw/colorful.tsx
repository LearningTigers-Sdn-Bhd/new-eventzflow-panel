"use client";

import { useColorfulBox } from "@/hooks/draw-styles/use-colorful-box";
import type { DrawProps } from "../type";
import { ColorfulGiftBox } from "./assets/colorful-gift-box";

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
			<ColorfulGiftBox isOpen={isOpen} isAnimating={isAnimating} />

			<button
				type="button"
				onClick={onDraw}
				disabled={isDrawing}
				className="mt-12 px-12 py-4 text-xl font-bold tracking-wide text-white uppercase
						   rounded-full bg-gradient-to-br from-red-500 to-red-600
						   border-t border-red-400/50
						   shadow-[0_8px_16px_-4px_rgba(220,38,38,0.5),0_4px_6px_-2px_rgba(220,38,38,0.3)]
						   hover:shadow-[0_12px_20px_-4px_rgba(220,38,38,0.6),0_8px_10px_-4px_rgba(220,38,38,0.4)]
						   hover:-translate-y-0.5
						   active:translate-y-0.5 active:shadow-sm
						   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
						   transition-all duration-300 ease-out"
			>
				{isDrawing ? "OPENING..." : "OPEN BOX"}
			</button>
		</div>
	);
}
