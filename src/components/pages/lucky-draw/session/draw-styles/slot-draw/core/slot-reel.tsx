import { CONTAINER_HEIGHT } from "@/hooks/draw-styles/use-slot";
import { cn } from "@/lib/utils";
import { DrawState } from "../../type";

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

	return (
		<div
			className="relative overflow-hidden bg-gray-50"
			style={{ height: `${CONTAINER_HEIGHT}px` }}
		>
			{/* Gradient Mask for 3D/Cylinder effect */}
			<div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-black/10 via-transparent to-black/10 mix-blend-multiply" />

			{/* Winner Text Overlay - appears above gradient */}
			{state === DrawState.WON && reel.length > 0 && (
				<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
					<span className="max-w-[85%] truncate text-center font-black text-2xl text-black uppercase tracking-widest">
						{reel[reel.length - 2]?.label}
					</span>
				</div>
			)}

			{/* The Moving Reel */}
			<div
				style={{
					transform: `translateY(-${offsetY}px)`,
					transition: isTransitioning
						? `transform ${spinDurationMs}ms cubic-bezier(0.15, 0.9, 0.35, 1)` // Custom bounce/elastic ease
						: "none",
					// Use mask image to fade top and bottom slightly
					maskImage:
						"linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
				}}
				className="flex w-full flex-col"
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
									"flex w-full shrink-0 items-center justify-center text-center font-bold uppercase tracking-widest transition-colors duration-300",
									state === DrawState.WON && index === reel.length - 2
										? "text-black opacity-0"
										: "text-gray-400",
								)}
								style={{ height: `${itemHeight}px` }}
							>
								<span className="max-w-[85%] truncate font-bold text-2xl">
									{label}
								</span>
							</div>
						))}
			</div>
		</div>
	);
};
