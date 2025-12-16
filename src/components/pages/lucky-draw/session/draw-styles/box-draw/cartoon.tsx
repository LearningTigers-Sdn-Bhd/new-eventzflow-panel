"use client";

import { useColorfulBox } from "@/hooks/draw-styles/use-colorful-box";
import type { DrawProps } from "../type";
import { CartoonGiftBox } from "./assets/cartoon-gift-box";

export function BoxDraw({
	participants,
	onDrawComplete,
	isDrawing,
	isCelebrating,
	onDraw,
	useGifts,
	hasAvailableGift,
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
			<CartoonGiftBox isOpen={isOpen} isAnimating={isAnimating} />

			<div className="mt-12 flex flex-col items-center gap-3">
				<button
					type="button"
					onClick={onDraw}
					disabled={isDrawing}
					className="px-8 py-4 text-2xl font-black tracking-wider uppercase
							   bg-yellow-400 border-4 border-black text-black rounded-2xl
							   shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
							   hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:rotate-1
							   active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:rotate-0
							   disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
							   transition-all duration-200"
				>
					{isDrawing ? "OPENING..." : "OPEN IT!"}
				</button>
				{useGifts && !hasAvailableGift && (
					<div className="rounded-lg border-2 border-orange-400 bg-orange-50 px-4 py-2 text-center text-orange-800 text-sm">
						⚠️ Please add gifts before drawing
					</div>
				)}
			</div>
		</div>
	);
}
