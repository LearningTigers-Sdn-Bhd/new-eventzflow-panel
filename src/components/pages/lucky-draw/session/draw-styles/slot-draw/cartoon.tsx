import { useEffect, useRef } from "react";
import { useSlot } from "@/hooks/draw-styles/use-slot";
import type { DrawProps } from "../type";
import { SlotMachineArt } from "./assets/slot-machine-art";
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

	const scaleContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateScale = () => {
			if (!scaleContainerRef.current) return;

			const width = window.innerWidth;
			let scale = 1;

			if (width <= 640) {
				scale = 0.55;
			} else if (width <= 1024) {
				scale = 0.85;
			} else {
				scale = 1;
			}

			scaleContainerRef.current.style.setProperty(
				"--slot-scale",
				String(scale),
			);
		};

		updateScale();
		window.addEventListener("resize", updateScale);

		return () => {
			window.removeEventListener("resize", updateScale);
		};
	}, []);

	return (
		<div className="flex h-full w-full items-center justify-center p-4">
			{/* Scaling Container - preserves aspect ratio and scales across viewports */}
			<div
				ref={scaleContainerRef}
				className="mx-auto"
				style={{
					transform: "scale(var(--slot-scale, 1))",
					transformOrigin: "center center",
				}}
			>
				<SlotMachineArt>
					<SlotReel
						state={state}
						reel={reel}
						offsetY={offsetY}
						isTransitioning={isTransitioning}
						isEmpty={isEmpty}
						spinDurationMs={spinDurationMs}
						itemHeight={itemHeight}
					/>
				</SlotMachineArt>
			</div>
		</div>
	);
};
