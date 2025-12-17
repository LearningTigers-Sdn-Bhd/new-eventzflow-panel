import { CONTAINER_HEIGHT } from "@/hooks/draw-styles/use-slot";
import { cn } from "@/lib/utils";
import { DrawState } from "../../type";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { useEffect } from "react";

interface ReelItem {
	id: string;
	label: string;
}

interface SlotReelProps {
	state: DrawState;
	reel: ReelItem[];
	offsetY: number;
	isTransitioning: boolean;
	isEmpty: boolean;
	spinDurationMs: number;
	itemHeight: number;
}

export const SlotReel = ({
	state,
	reel,
	offsetY,
	isTransitioning,
	isEmpty,
	spinDurationMs,
	itemHeight,
}: SlotReelProps) => {
	const placeholderSlots = ["top", "center", "bottom"];
	const y = useMotionValue(0);

	// Create suspense animation with extreme slowdown before winner
	useEffect(() => {
		if (isTransitioning && offsetY > 0) {
			const finalStop = -offsetY; // The real winner (negative for translateY)

			// Animate: fast spin, then EXTREME slowdown at the very end
			animate(y, finalStop, {
				duration: spinDurationMs / 1000,
				ease: [0.5, 0.01, 0.1, 1], // Fast start (50%), then crawls to finish (0.01 = almost stops)
			});
		} else {
			y.set(-offsetY);
		}
	}, [offsetY, isTransitioning, spinDurationMs, y]);

	return (
		<div
			className="relative overflow-hidden bg-gray-50"
			style={{ height: `${CONTAINER_HEIGHT}px` }}
		>
			{/* Gradient Mask for 3D/Cylinder effect */}
			<div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-black/10 via-transparent to-black/10 mix-blend-multiply" />

			{/* Winner Text Overlay - appears above gradient */}
			{state === DrawState.WON && reel.length > 0 && (
				<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4">
					<span className="max-w-full truncate text-center font-black text-xl text-black uppercase tracking-widest">
						{reel[reel.length - 2]?.label}
					</span>
				</div>
			)}

			{/* The Moving Reel */}
			<motion.div
				style={{
					translateY: y,
					// Use mask image to fade top and bottom slightly
					maskImage:
						"linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
				}}
				className="flex min-w-0 w-full flex-col"
			>
				{isEmpty
					? // Empty State Placeholders
						placeholderSlots.map((slotKey, index) => (
							<div
								key={slotKey}
								className="flex w-full items-center justify-center text-center font-bold text-gray-300 uppercase tracking-widest"
								style={{ height: `${itemHeight}px` }}
							>
								{index === 1 ? "ADD NAMES" : "---"}
							</div>
						))
					: // Active Reel
						reel.map(({ id, label }, index) => (
							<div
								key={id}
								className={cn(
									"flex w-full shrink-0 items-center justify-center px-2 text-center font-bold uppercase tracking-widest transition-colors duration-300",
									state === DrawState.WON && index === reel.length - 2
										? "text-black opacity-0"
										: "text-gray-400",
								)}
								style={{ height: `${itemHeight}px` }}
							>
								<span className="max-w-full truncate px-2 font-bold text-xl">
									{label}
								</span>
							</div>
						))}
			</motion.div>
		</div>
	);
};
