"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { useDialog } from "@/hooks/use-dialog";
import type { Participant } from "@/stores/lucky-draw-store";
import { CelebrationDialogContent } from "./celebration-dialog-content";

// Union type for prize/gift - can be Prize (roulette) or Gift (lucky draw)
type PrizeOrGift =
	| { type: "prize"; name: string; image_url?: string | null }
	| { type: "gift"; name: string };

type ConfettiEffectType = "side-cannons" | "fireworks";

interface CelebrationData {
	winner: Participant;
	prizeOrGift?: PrizeOrGift | null;
	effectType?: ConfettiEffectType;
}

interface CelebrationDialogContextValue {
	showCelebration: (data: CelebrationData) => void;
	closeCelebration: () => void;
	isOpen: boolean;
}

const CelebrationDialogContext = createContext<
	CelebrationDialogContextValue | undefined
>(undefined);

interface CelebrationDialogProviderProps {
	children: React.ReactNode;
	delayBeforeShow?: number; // Delay in ms before showing dialog after celebration starts
}

export function CelebrationDialogProvider({
	children,
	delayBeforeShow = 1500,
}: CelebrationDialogProviderProps) {
	const { openDialog, closeDialog, isOpen } = useDialog();
	const celebrationTimeoutRef = useRef<number | null>(null);

	const showCelebration = useCallback(
		(data: CelebrationData) => {
			// Clear any existing timeout
			if (celebrationTimeoutRef.current) {
				clearTimeout(celebrationTimeoutRef.current);
			}

			// Wait a bit after the animation finishes before showing the modal
			celebrationTimeoutRef.current = window.setTimeout(() => {
				openDialog({
					component: CelebrationDialogContent,
					props: {
						winner: data.winner,
						prizeOrGift: data.prizeOrGift,
						onClose: closeDialog,
						effectType: data.effectType ?? "side-cannons",
					},
					config: {
						size: "lg",
						// Force removal of default rounded corners and padding from shadcn DialogContent
						className:
							"!rounded-none !p-0 !border-4 !border-primary overflow-hidden",
					},
				});
			}, delayBeforeShow);
		},
		[openDialog, closeDialog, delayBeforeShow],
	);

	const closeCelebration = useCallback(() => {
		if (celebrationTimeoutRef.current) {
			clearTimeout(celebrationTimeoutRef.current);
			celebrationTimeoutRef.current = null;
		}
		closeDialog();
	}, [closeDialog]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (celebrationTimeoutRef.current) {
				clearTimeout(celebrationTimeoutRef.current);
			}
		};
	}, []);

	const contextValue = useMemo<CelebrationDialogContextValue>(
		() => ({
			showCelebration,
			closeCelebration,
			isOpen,
		}),
		[showCelebration, closeCelebration, isOpen],
	);

	return (
		<CelebrationDialogContext.Provider value={contextValue}>
			{children}
		</CelebrationDialogContext.Provider>
	);
}

/**
 * Hook to access celebration dialog context
 * @throws Error if used outside CelebrationDialogProvider
 */
export function useCelebrationDialog(): CelebrationDialogContextValue {
	const context = useContext(CelebrationDialogContext);
	if (context === undefined) {
		throw new Error(
			"useCelebrationDialog must be used within a CelebrationDialogProvider",
		);
	}
	return context;
}
