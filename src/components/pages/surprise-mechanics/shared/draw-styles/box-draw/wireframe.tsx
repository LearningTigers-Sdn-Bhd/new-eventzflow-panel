"use client";

import { useColorfulBox } from "@/hooks/surprise/shared/use-colorful-box";
import type { DrawProps } from "../type";
import { WireframeGiftBox } from "./assets/wireframe-gift-box";

export function BoxDraw({
	participants,
	prizes,
	mode = "participants",
	onDrawComplete,
	isDrawing,
	isCelebrating,
	onDraw,
	useGifts,
	hasAvailableGift,
}: DrawProps) {
	const { containerRef, isEmpty, isOpen, isAnimating } = useColorfulBox({
		participants,
		prizes,
		mode,
		onDrawComplete,
		isDrawing,
		isCelebrating,
	});

	if (isEmpty) {
		return (
			<div className="flex h-96 items-center justify-center text-muted-foreground">
				{mode === "prizes"
					? "No prizes available"
					: "No participants available"}
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="flex h-[600px] w-full flex-col items-center justify-center"
		>
			<WireframeGiftBox isOpen={isOpen} isAnimating={isAnimating} />

			<div className="mt-12 flex flex-col items-center gap-3">
				<button
					type="button"
					onClick={onDraw}
					disabled={isDrawing}
					className="border-2 border-slate-800 bg-white px-10 py-4 font-bold text-slate-800 text-xl uppercase tracking-[0.2em] shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(30,41,59,1)] active:translate-y-1 active:shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
				>
					{isDrawing ? "OPENING..." : "OPEN BOX"}
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
