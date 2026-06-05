"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import {
	CelebrationDialogProvider,
	useCelebrationDialog,
} from "@/components/pages/surprise-mechanics/shared/celebration-dialog/celebration-dialog-provider";
import type { Prize } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import { useDrawCompletion } from "@/hooks/surprise/roulette/use-draw-completion";
import { usePrizeRoulette } from "@/hooks/surprise/roulette/use-prize-roulette";
import { useQueueInitialization } from "@/hooks/surprise/roulette/use-queue-initialization";
import { useCelebration } from "@/hooks/surprise/shared/use-celebration";
import { useFullscreen } from "@/hooks/surprise/shared/use-fullscreen";
import { useSessionBackground } from "@/hooks/surprise/shared/use-session-background";
import { useSessionSheets } from "@/hooks/surprise/shared/use-session-sheets";
import { useDialog } from "@/hooks/use-dialog";
import type { RouletteSession } from "@/lib/api/roulette/response";
import type { Participant } from "@/stores/lucky-draw-store";
import {
	type ParticipantQueueItem,
	useRouletteParticipantQueueStore,
} from "@/stores/roulette-participant-queue-store";
import { DrawScannerDialog } from "./dialogs/draw-scanner-dialog";

interface RouletteSessionContextValue {
	// Props (read-only)
	eventId: string;
	sessionId: number;
	session: RouletteSession;
	eventName: string;

	// UI State
	isDisplayMode: boolean;
	toggleDisplayMode: () => void;
	isFullscreen: boolean;
	toggleFullscreen: () => void;
	sheetState: ReturnType<typeof useSessionSheets>;

	// Draw State
	isDrawing: boolean;
	canDraw: boolean;
	isCelebrating: boolean;
	drawResetKey: number;

	// Draw Data
	availablePrizes: Prize[];
	drawStyle: "wheel" | "slot" | "box" | null;
	drawTheme: "wireframe" | "colorful" | "cartoon";
	backgroundStyle: React.CSSProperties;

	// Queue State
	queue: ParticipantQueueItem[];
	currentParticipantIndex: number | null;

	// Actions
	handleOpenDrawDialog: () => void;
	handleOpenAddParticipantDialog: () => void;
	handleDrawComplete: (selectedPrize: Prize) => Promise<void>;
	clearQueue: () => void;
}

const RouletteSessionContext = createContext<
	RouletteSessionContextValue | undefined
>(undefined);

interface RouletteSessionProviderProps {
	eventId: string;
	sessionId: number;
	session: RouletteSession;
	eventName: string;
	children: React.ReactNode;
}

function RouletteSessionProviderInner({
	eventId,
	sessionId,
	session,
	eventName,
	children,
}: RouletteSessionProviderProps) {
	const { showCelebration } = useCelebrationDialog();
	const { openDialog, closeDialog } = useDialog();
	const [isDisplayMode, setIsDisplayMode] = useState(false);
	const { isFullscreen, toggleFullscreen } = useFullscreen();

	// Sheet state management
	const sheetState = useSessionSheets();

	// Queue store
	const {
		queue,
		getCurrentParticipant,
		setCurrentParticipantIndex,
		decrementDraws,
		removeParticipant,
		clearQueue,
		currentParticipantIndex,
	} = useRouletteParticipantQueueStore();

	// Initialize queue when it changes
	useQueueInitialization();

	// Get all data and actions from unified hook
	const prizeRoulette = usePrizeRoulette(eventId, sessionId, eventName);

	const {
		// Data
		availablePrizes,
		drawStyle,
		drawTheme,
		wrapperBackground,
		canDraw,

		// UI State
		isDrawing,

		// Actions
		startDrawing,
		stopDrawing,
		createWinner,
	} = prizeRoulette;

	// Get background style from custom hook
	const { backgroundStyle } = useSessionBackground(wrapperBackground);

	// Celebration state management
	const { shouldCelebrate, drawResetKey, startCelebration } = useCelebration();

	// Get draw_counts from session (default to 1)
	const drawCounts = session.draw_counts ?? 1;
	// Get is_multiple from session (default to false)
	const isMultiple = session.is_multiple ?? false;

	// Draw completion handler with celebration dialog
	const { handleDrawComplete } = useDrawCompletion({
		session,
		queue,
		getCurrentParticipant,
		decrementDraws,
		removeParticipant,
		createWinner,
		stopDrawing,
		onCelebrationStart: (participant, prize) => {
			startCelebration();
			// Convert RouletteParticipant to shared Participant type
			const sharedParticipant: Participant = {
				name: participant.name,
				type: participant.type,
				publicId: participant.publicId,
			};
			// Show celebration dialog with prize
			showCelebration({
				winner: sharedParticipant,
				prizeOrGift: {
					type: "prize",
					name: prize.name,
					image_url: prize.image_url,
				},
				effectType: "side-cannons",
			});
		},
	});

	// Handle opening scanner dialog (for adding participants)
	const handleOpenAddParticipantDialog = useCallback(() => {
		const handleScanSuccess = () => {
			closeDialog();
			sheetState.participantQueue.onOpenChange(true);
		};

		const dialogProps = {
			eventId,
			sessionId,
			drawCounts,
			isMultiple,
			onClose: closeDialog,
			onScanSuccess: handleScanSuccess,
		};

		const dialogConfig = {
			size: "full" as const,
			showCloseButton: false,
			title: "Add Participant",
			description: "Scan participant QR code to add to queue",
		};

		openDialog({
			component: DrawScannerDialog,
			props: dialogProps,
			config: dialogConfig,
		});
	}, [
		eventId,
		sessionId,
		drawCounts,
		isMultiple,
		closeDialog,
		openDialog,
		sheetState.participantQueue,
	]);

	// Handle draw button click - check queue state
	const handleOpenDrawDialog = useCallback(() => {
		if (!canDraw) return;

		// If queue is empty, open scanner dialog
		if (queue.length === 0) {
			handleOpenAddParticipantDialog();
			return;
		}

		// Queue has participants, ensure current participant is set
		if (currentParticipantIndex === null) {
			setCurrentParticipantIndex(0);
		}
		startDrawing();
	}, [
		canDraw,
		queue.length,
		currentParticipantIndex,
		setCurrentParticipantIndex,
		startDrawing,
		handleOpenAddParticipantDialog,
	]);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo<RouletteSessionContextValue>(
		() => ({
			// Props
			eventId,
			sessionId,
			session,
			eventName,

			// UI State
			isDisplayMode,
			toggleDisplayMode: () => setIsDisplayMode((prev) => !prev),
			isFullscreen,
			toggleFullscreen,
			sheetState,

			// Draw State
			isDrawing,
			canDraw,
			isCelebrating: shouldCelebrate,
			drawResetKey,

			// Draw Data
			availablePrizes,
			drawStyle,
			drawTheme,
			backgroundStyle,

			// Queue State
			queue,
			currentParticipantIndex,

			// Actions
			handleOpenDrawDialog,
			handleOpenAddParticipantDialog,
			handleDrawComplete,
			clearQueue,
		}),
		[
			eventId,
			sessionId,
			session,
			eventName,
			isDisplayMode,
			isFullscreen,
			toggleFullscreen,
			sheetState,
			isDrawing,
			canDraw,
			shouldCelebrate,
			drawResetKey,
			availablePrizes,
			drawStyle,
			drawTheme,
			backgroundStyle,
			queue,
			currentParticipantIndex,
			handleOpenDrawDialog,
			handleOpenAddParticipantDialog,
			handleDrawComplete,
			clearQueue,
		],
	);

	return (
		<RouletteSessionContext.Provider value={contextValue}>
			{children}
		</RouletteSessionContext.Provider>
	);
}

export function RouletteSessionProvider({
	eventId,
	sessionId,
	session,
	eventName,
	children,
}: RouletteSessionProviderProps) {
	return (
		<CelebrationDialogProvider>
			<RouletteSessionProviderInner
				eventId={eventId}
				sessionId={sessionId}
				session={session}
				eventName={eventName}
			>
				{children}
			</RouletteSessionProviderInner>
		</CelebrationDialogProvider>
	);
}

/**
 * Hook to access roulette session context
 * @throws Error if used outside RouletteSessionProvider
 */
export function useRouletteSession(): RouletteSessionContextValue {
	const context = useContext(RouletteSessionContext);
	if (context === undefined) {
		throw new Error(
			"useRouletteSession must be used within a RouletteSessionProvider",
		);
	}
	return context;
}
