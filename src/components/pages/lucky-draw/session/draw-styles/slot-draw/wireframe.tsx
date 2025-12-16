"use client";

import { useSlot } from "@/hooks/draw-styles/use-slot";
import type { DrawProps } from "../type";
import { SlotReel } from "./core/slot-reel";
import { WireframeSlotMachine } from "./assets/wireframe-slot-machine";

export const SlotDraw = ({
	participants,
	onDrawComplete,
	isDrawing,
	onDraw,
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
			{/* The Machine Case - Enhanced Wireframe Style */}
			<WireframeSlotMachine isDrawing={isDrawing} onSpin={onDraw}>
				<SlotReel
					state={state}
					reel={reel}
					offsetY={offsetY}
					isTransitioning={isTransitioning}
					isEmpty={isEmpty}
					spinDurationMs={spinDurationMs}
					itemHeight={itemHeight}
				/>
			</WireframeSlotMachine>
		</div>
	);
};
