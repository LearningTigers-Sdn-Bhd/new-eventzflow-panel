"use client";

import { useSlot } from "@/hooks/draw-styles/use-slot";
import type { DrawProps } from "../type";
import { SlotReel } from "./core/slot-reel";

export const SlotDraw = ({
	participants,
	onDrawComplete,
	isDrawing,
}: DrawProps) => {
	const {
		state,
		reel,
		offsetY,
		isTransitioning,
		isEmpty,
		spinDurationMs,
		itemHeight,
	} = useSlot({ participants, onDrawComplete, isDrawing });

	return (
		<div className="mx-auto flex w-full max-w-md flex-col gap-8">
			{/* The Machine Case - Simple Wireframe Style */}
			<div className="relative border-4 border-dashed border-gray-300 bg-gray-50 p-4">
				<div className="flex items-center justify-center p-2 mb-4 border-2 border-gray-200 bg-white">
					<span className="text-gray-400 font-mono text-sm uppercase">Slot Machine Wireframe</span>
				</div>
				
				<div className="relative bg-white border-2 border-gray-900 overflow-hidden">
					<SlotReel
						state={state}
						reel={reel}
						offsetY={offsetY}
						isTransitioning={isTransitioning}
						isEmpty={isEmpty}
						spinDurationMs={spinDurationMs}
						itemHeight={itemHeight}
					/>
				</div>

				<div className="mt-4 flex justify-center">
					<div className="h-8 w-3/4 bg-gray-200 rounded-sm border border-gray-300 flex items-center justify-center">
						<span className="text-xs text-gray-500">Controls / Output</span>
					</div>
				</div>
			</div>
		</div>
	);
};
