"use client";

import type { Prize } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import { Skeleton } from "@/components/ui/skeleton";
import type { Participant } from "@/stores/lucky-draw-store";
import { useDrawContextOptional } from "../contexts/draw-context";
import { BoxDraw } from "../draw-styles/box-draw";
import { SlotDraw } from "../draw-styles/slot-draw";
import WheelDrawNew from "../draw-styles/wheel-draw";

interface DrawComponentProps {
	drawStyle?: "wheel" | "slot" | "box" | null;
	drawTheme?: "wireframe" | "colorful" | "cartoon";
	availablePrizes?: Prize[];
	availableParticipants?: Participant[];
	isDrawing?: boolean;
	isCelebrating?: boolean;
	drawResetKey?: number;
	onDrawComplete?: (selectedPrize: Prize) => Promise<void>;
	onDraw?: () => void;
	useGifts?: boolean;
	hasAvailableGift?: boolean;
	isLoading?: boolean;
}

/**
 * Type guard to check if winner is a Prize
 */
function isPrize(winner: Participant | Prize): winner is Prize {
	// Prize has image_url and remaining properties that Participant doesn't have
	return (
		typeof winner === "object" &&
		winner !== null &&
		("image_url" in winner || "remaining" in winner || "quantity" in winner)
	);
}

export function DrawComponent(props?: DrawComponentProps) {
	// Try to get context first (new pattern)
	const context = useDrawContextOptional();

	// Use props if provided (backward compatible), otherwise use context
	const drawStyle = props?.drawStyle ?? context?.drawStyle ?? null;
	const drawTheme = props?.drawTheme ?? context?.drawTheme ?? "wireframe";
	const availablePrizes = props?.availablePrizes ?? context?.prizes ?? [];
	const availableParticipants =
		props?.availableParticipants ?? context?.participants ?? [];
	const isDrawing = props?.isDrawing ?? context?.isDrawing ?? false;
	const isCelebrating = props?.isCelebrating ?? context?.isCelebrating ?? false;
	const drawResetKey = props?.drawResetKey ?? context?.drawResetKey ?? 0;
	const onDrawCompleteProp = props?.onDrawComplete;
	const onDrawCompleteContext = context?.onDrawComplete;
	const onDraw = props?.onDraw ?? context?.onDraw;
	const useGifts = props?.useGifts ?? context?.useGifts ?? false;
	const hasAvailableGift =
		props?.hasAvailableGift ?? context?.hasAvailableGift ?? false;
	const isLoading = props?.isLoading ?? context?.isLoading ?? false;

	// Determine mode from data
	// If participants are provided, use participants mode
	// Otherwise, use prizes mode
	const mode: "participants" | "prizes" =
		availableParticipants.length > 0 ? "participants" : "prizes";
	const participants =
		mode === "participants" ? availableParticipants : undefined;
	const prizes = mode === "prizes" ? availablePrizes : undefined;

	// Handle onDrawComplete callback
	// If props provide a Prize-only callback, wrap it
	// Otherwise, use context callback which handles both types
	const handleDrawComplete = (winner: Participant | Prize): void => {
		if (onDrawCompleteProp) {
			// Props callback expects Prize only
			if (!isPrize(winner)) {
				console.error(
					"Expected Prize but received Participant. This should not happen in prizes mode.",
				);
				return;
			}
			// Call the async function but don't await it (since the draw components expect void return)
			Promise.resolve(onDrawCompleteProp(winner)).catch((error) => {
				console.error("Error in onDrawComplete:", error);
			});
		} else if (onDrawCompleteContext) {
			// Context callback handles both types
			Promise.resolve(onDrawCompleteContext(winner)).catch((error) => {
				console.error("Error in onDrawComplete:", error);
			});
		}
	};

	// Show loading state if provided
	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Skeleton className="h-full w-full max-w-md" />
			</div>
		);
	}

	if (!drawStyle) {
		return (
			<div className="flex h-96 items-center justify-center">
				<p className="text-muted-foreground">No draw style configured</p>
			</div>
		);
	}

	// Common props for all draw styles
	const commonProps = {
		onDrawComplete: handleDrawComplete,
		isDrawing,
		isCelebrating,
		onDraw,
		mode,
		theme: drawTheme,
		useGifts,
		hasAvailableGift,
	};

	switch (drawStyle) {
		case "wheel":
			return (
				<WheelDrawNew
					key={`wheel-${drawResetKey}`}
					participants={participants}
					prizes={prizes}
					{...commonProps}
				/>
			);
		case "slot":
			return (
				<SlotDraw
					key={`slot-${drawResetKey}`}
					participants={participants}
					prizes={prizes}
					{...commonProps}
				/>
			);
		case "box":
			return (
				<BoxDraw
					key={`box-${drawResetKey}`}
					participants={participants}
					prizes={prizes}
					{...commonProps}
				/>
			);
		default:
			return null;
	}
}
