"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import {
	CelebrationDialogProvider,
	useCelebrationDialog,
} from "@/components/pages/surprise-mechanics/shared/celebration-dialog/celebration-dialog-provider";
import { useCelebration } from "@/hooks/surprise/shared/use-celebration";
import { useSessionBackground } from "@/hooks/surprise/shared/use-session-background";
import { useSessionSheets } from "@/hooks/surprise/shared/use-session-sheets";
import { useLuckyDraw } from "@/hooks/use-lucky-draw";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import type { Participant } from "@/stores/lucky-draw-store";

interface LuckyDrawSessionContextValue {
	// Props (read-only)
	eventId: string;
	sessionId: number;
	session: LuckyDrawSession;
	eventName: string;

	// UI State
	isDisplayMode: boolean;
	toggleDisplayMode: () => void;
	sheetState: ReturnType<typeof useSessionSheets>;

	// Draw State
	isDrawing: boolean;
	canDraw: boolean;
	isCelebrating: boolean;
	drawResetKey: number;

	// Draw Data
	availableParticipants: Participant[];
	nextAvailableGift: ReturnType<typeof useLuckyDraw>["nextAvailableGift"];
	drawStyle: "wheel" | "slot" | "box" | null;
	drawTheme: "wireframe" | "colorful" | "cartoon";
	backgroundStyle: React.CSSProperties;
	useGifts: boolean;
	useTicket: boolean;
	isLoadingConfig: boolean;

	// Actions
	handleDraw: () => void;
	handleDrawComplete: (winner: Participant) => Promise<void>;
	luckyDraw: ReturnType<typeof useLuckyDraw>;
}

const LuckyDrawSessionContext = createContext<
	LuckyDrawSessionContextValue | undefined
>(undefined);

interface LuckyDrawSessionProviderProps {
	eventId: string;
	sessionId: number;
	session: LuckyDrawSession;
	eventName: string;
	children: React.ReactNode;
}

function LuckyDrawSessionProviderInner({
	eventId,
	sessionId,
	session,
	eventName,
	children,
}: LuckyDrawSessionProviderProps) {
	const [isDisplayMode, setIsDisplayMode] = useState(false);
	const { showCelebration } = useCelebrationDialog();

	// Sheet state management
	const sheetState = useSessionSheets();

	// Get all data and actions from unified hook
	const luckyDraw = useLuckyDraw(eventId, sessionId, eventName);

	const {
		// Data
		availableParticipants,
		nextAvailableGift,
		drawStyle,
		drawTheme,
		useGifts,
		wrapperBackground,
		useTicket,
		canDraw,

		// UI State
		isDrawing,

		// Loading states
		isLoadingConfig,

		// Actions
		startDrawing,
		stopDrawing,
		addInvalidParticipant,
		assignWinner,
	} = luckyDraw;

	// Get background style from custom hook
	const { backgroundStyle } = useSessionBackground(wrapperBackground);

	// Celebration state management
	const { shouldCelebrate, drawResetKey, startCelebration } = useCelebration();

	// Handle draw button click
	const handleDraw = useCallback(() => {
		if (canDraw && availableParticipants.length > 0) {
			startDrawing();
		}
	}, [canDraw, availableParticipants.length, startDrawing]);

	// Handle draw completion
	const handleDrawComplete = useCallback(
		async (winner: Participant) => {
			// Execute async logic without blocking the callback
			let success = false;
			let assignedGift: import("@/stores/lucky-draw-store").Gift | null = null;

			try {
				if (useGifts) {
					if (nextAvailableGift) {
						assignedGift = nextAvailableGift;
						// Check if this gift still needs more winners
						const actualCount = nextAvailableGift.actual_winner_count ?? 0;
						if (actualCount < nextAvailableGift.winner_counts) {
							await assignWinner(nextAvailableGift.id, winner, useTicket);
							success = true;
						} else {
							// Gift is already fulfilled
							toast.error("This gift already has enough winners");
							return;
						}
					} else {
						// No available gift
						toast.error("No available gift to assign winner");
						return;
					}
				} else {
					await addInvalidParticipant(winner, useTicket);
					success = true;
				}
			} catch {
				// Error handling is done in the mutation hooks
			} finally {
				// Always reset drawing state after completion
				stopDrawing();
			}

			// Only show winner dialog if operation was successful
			if (success) {
				// Start celebration immediately when drawing finishes
				startCelebration();

				// Show celebration dialog using shared provider
				showCelebration({
					winner,
					prizeOrGift: assignedGift
						? { type: "gift", name: assignedGift.name }
						: null,
					effectType: "side-cannons",
				});
			}
		},
		[
			useGifts,
			nextAvailableGift,
			assignWinner,
			useTicket,
			addInvalidParticipant,
			stopDrawing,
			startCelebration,
			showCelebration,
		],
	);

	// Celebration state: active when drawing is finished (starts immediately) and continues until modal closes
	const isCelebrating = shouldCelebrate;

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo<LuckyDrawSessionContextValue>(
		() => ({
			// Props
			eventId,
			sessionId,
			session,
			eventName,

			// UI State
			isDisplayMode,
			toggleDisplayMode: () => setIsDisplayMode((prev) => !prev),
			sheetState,

			// Draw State
			isDrawing,
			canDraw,
			isCelebrating,
			drawResetKey,

			// Draw Data
			availableParticipants,
			nextAvailableGift,
			drawStyle,
			drawTheme,
			backgroundStyle,
			useGifts,
			useTicket,
			isLoadingConfig,

			// Actions
			handleDraw,
			handleDrawComplete,
			luckyDraw,
		}),
		[
			eventId,
			sessionId,
			session,
			eventName,
			isDisplayMode,
			sheetState,
			isDrawing,
			canDraw,
			isCelebrating,
			drawResetKey,
			availableParticipants,
			nextAvailableGift,
			drawStyle,
			drawTheme,
			backgroundStyle,
			useGifts,
			useTicket,
			isLoadingConfig,
			handleDraw,
			handleDrawComplete,
			luckyDraw,
		],
	);

	return (
		<LuckyDrawSessionContext.Provider value={contextValue}>
			{children}
		</LuckyDrawSessionContext.Provider>
	);
}

export function LuckyDrawSessionProvider({
	eventId,
	sessionId,
	session,
	eventName,
	children,
}: LuckyDrawSessionProviderProps) {
	return (
		<CelebrationDialogProvider>
			<LuckyDrawSessionProviderInner
				eventId={eventId}
				sessionId={sessionId}
				session={session}
				eventName={eventName}
			>
				{children}
			</LuckyDrawSessionProviderInner>
		</CelebrationDialogProvider>
	);
}

/**
 * Hook to access lucky draw session context
 * @throws Error if used outside LuckyDrawSessionProvider
 */
export function useLuckyDrawSession(): LuckyDrawSessionContextValue {
	const context = useContext(LuckyDrawSessionContext);
	if (context === undefined) {
		throw new Error(
			"useLuckyDrawSession must be used within a LuckyDrawSessionProvider",
		);
	}
	return context;
}
