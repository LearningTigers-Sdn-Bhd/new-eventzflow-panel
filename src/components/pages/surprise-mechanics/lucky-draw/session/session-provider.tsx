"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import {
	CelebrationDialogProvider,
	useCelebrationDialog,
} from "@/components/pages/surprise-mechanics/shared/celebration-dialog/celebration-dialog-provider";
import { useCelebration } from "@/hooks/surprise/shared/use-celebration";
import { useFullscreen } from "@/hooks/surprise/shared/use-fullscreen";
import { useSessionBackground } from "@/hooks/surprise/shared/use-session-background";
import { useSessionSheets } from "@/hooks/surprise/shared/use-session-sheets";
import { useLuckyDraw } from "@/hooks/use-lucky-draw";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import type { Gift, Participant } from "@/stores/lucky-draw-store";
import { pickRandomWinners } from "../batch-draw";

// Pause between quick rounds so each stop reads clearly
const NEXT_ROUND_DELAY_MS = 350;

interface LuckyDrawSessionContextValue {
	// Props (read-only)
	eventId: string;
	sessionId: number;
	session: LuckyDrawSession;
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
	availableParticipants: Participant[];
	nextAvailableGift: ReturnType<typeof useLuckyDraw>["nextAvailableGift"];
	drawStyle: "wheel" | "slot" | "box" | null;
	drawTheme: "wireframe" | "colorful" | "cartoon";
	backgroundStyle: React.CSSProperties;
	useGifts: boolean;
	useTicket: boolean;
	isLoadingConfig: boolean;

	winnersPerDraw: number;
	batchSize: number;
	// True when one click draws several winners (winners per draw > 1 or a round sweep)
	isBatchDraw: boolean;

	// Actions
	handleDraw: () => void;
	handleDrawComplete: (winner: Participant) => Promise<void>;
	handleBatchComplete: (winner: Participant) => Promise<void>;
	batchPicked: Participant[];
	batchTotal: number;
	batchSkipped: boolean;
	skipBatch: () => Promise<void>;
	// A winner of the reveal did not show up: void them and redraw just that slot
	redrawBatchSlot: (index: number) => Promise<void>;
	batchWinners: Participant[] | null;
	batchTitle: string;
	batchGiftNames: string[] | null;
	clearBatchWinners: () => void;
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
	const [batchWinners, setBatchWinners] = useState<Participant[] | null>(null);
	// Round/gift the batch was drawn for (the next gift changes once it is saved)
	const [batchTitle, setBatchTitle] = useState("Winners");
	// True when the animation was skipped: the reveal then adds its own suspense
	const [batchSkipped, setBatchSkipped] = useState(false);
	// Multi-winner draw in progress: winners picked so far, one per quick round
	const [batchPicked, setBatchPicked] = useState<Participant[]>([]);
	const [batchTotal, setBatchTotal] = useState(0);
	// Gift name per winner of the reveal (round sweep only)
	const [batchGiftNames, setBatchGiftNames] = useState<string[] | null>(null);
	const batchRunRef = useRef<{
		total: number;
		title: string;
		picked: Participant[];
		// Gift of each winner, in draw order (empty when gifts are off)
		targets: Gift[];
	} | null>(null);
	const { showCelebration, closeCelebration } = useCelebrationDialog();
	const { isFullscreen, toggleFullscreen } = useFullscreen();

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
		winnersPerDraw,
		batchSize,
		giftTargets,
		isBatchDraw,
		roundSweep,
		nextRound,

		// UI State
		isDrawing,

		// Loading states
		isLoadingConfig,

		// Actions
		startDrawing,
		stopDrawing,
		addInvalidParticipant,
		assignWinner,
		assignWinners,
		assignSweep,
		addInvalidParticipants,
	} = luckyDraw;

	// Get background style from custom hook
	const { backgroundStyle } = useSessionBackground(wrapperBackground);

	// Celebration state management
	const { shouldCelebrate, drawResetKey, startCelebration } = useCelebration();

	// Handle draw button click
	const handleDraw = useCallback(() => {
		if (batchRunRef.current) return; // a multi-winner draw is already running
		if (canDraw && availableParticipants.length > 0) {
			setBatchWinners(null);
			if (isBatchDraw) {
				const total = Math.max(batchSize, 1);
				batchRunRef.current = {
					total,
					title: roundSweep
						? `Round ${nextRound}`
						: useGifts
							? (nextAvailableGift?.name ?? "Winners")
							: "Winners",
					picked: [],
					targets: giftTargets,
				};
				setBatchPicked([]);
				setBatchTotal(total);
			}
			startDrawing();
		}
	}, [
		canDraw,
		availableParticipants.length,
		isBatchDraw,
		batchSize,
		roundSweep,
		nextRound,
		useGifts,
		nextAvailableGift,
		giftTargets,
		startDrawing,
	]);

	// The celebration dialog outlives the render that opened it, so it reaches the
	// latest values through this ref
	const latest = useRef({ handleDraw, availableParticipants, luckyDraw });
	latest.current = { handleDraw, availableParticipants, luckyDraw };

	// The winner on the celebration dialog did not show up: void them, draw again
	const redrawWinner = useCallback(
		async (winner: Participant) => {
			closeCelebration();
			if (!(await latest.current.luckyDraw.voidWinner(winner))) return;
			// Let the refreshed lists reach the screen before drawing again
			setTimeout(() => latest.current.handleDraw(), 150);
		},
		[closeCelebration],
	);

	// F toggles fullscreen, since the on-screen toggle is hidden until hovered
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const typing = (e.target as HTMLElement | null)?.closest(
				"input, textarea, select, [contenteditable]",
			);
			const plain = !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey;
			if (plain && !typing && e.key.toLowerCase() === "f") toggleFullscreen();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [toggleFullscreen]);

	// Leaving the page mid-draw must not restart a round afterwards
	useEffect(
		() => () => {
			batchRunRef.current = null;
		},
		[],
	);

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
					onRedraw: () => redrawWinner(winner),
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
			redrawWinner,
		],
	);

	// Multi-winner draw, last step: save every winner in one request, then show
	// the reveal. Used when all rounds finished and when the animation is skipped.
	const finishBatch = useCallback(
		async (
			title: string,
			winners: Participant[],
			skipped: boolean,
			targets: Gift[],
		) => {
			let saved = false;
			try {
				if (useGifts && roundSweep) {
					// Winner i belongs to gift i; saved together as one round
					saved = await assignSweep(
						winners.map((winner, i) => ({ gift: targets[i], winner })),
						useTicket,
					);
				} else if (useGifts) {
					if (nextAvailableGift) {
						saved = await assignWinners(
							nextAvailableGift.id,
							winners,
							useTicket,
						);
					} else {
						toast.error("No available gift to assign winners");
					}
				} else {
					saved = await addInvalidParticipants(winners, useTicket);
				}
			} finally {
				batchRunRef.current = null;
				setBatchTotal(0);
				setBatchPicked([]);
				stopDrawing();
			}

			if (saved) {
				startCelebration();
				setBatchTitle(title);
				setBatchSkipped(skipped);
				setBatchGiftNames(
					useGifts && roundSweep ? targets.map((gift) => gift.name) : null,
				);
				setBatchWinners(winners);
			}
		},
		[
			useGifts,
			roundSweep,
			nextAvailableGift,
			assignSweep,
			assignWinners,
			addInvalidParticipants,
			useTicket,
			stopDrawing,
			startCelebration,
		],
	);

	// Multi-winner draw: the selected style plays one quick round per winner. Each
	// round reports its winner here; once every round is done all winners are
	// saved in one request and revealed one by one.
	const handleBatchComplete = useCallback(
		async (winner: Participant): Promise<void> => {
			const run = batchRunRef.current;
			if (!run) return; // a skipped or finished draw: ignore the round still in flight

			run.picked = [...run.picked, winner];
			setBatchPicked(run.picked);

			if (run.picked.length < run.total) {
				stopDrawing();
				setTimeout(() => {
					if (batchRunRef.current === run) startDrawing();
				}, NEXT_ROUND_DELAY_MS);
				return;
			}

			await finishBatch(run.title, run.picked, false, run.targets);
		},
		[startDrawing, stopDrawing, finishBatch],
	);

	// Skip the remaining rounds: pick the rest at random right away. Handy when
	// the draw is large (100 winners would take minutes of animation).
	const skipBatch = useCallback(async () => {
		const run = batchRunRef.current;
		if (!run) return;
		batchRunRef.current = null; // the round in flight is ignored from here on

		const taken = new Set(run.picked.map((p) => p.publicId));
		const rest = pickRandomWinners(
			availableParticipants.filter((p) => !taken.has(p.publicId)),
			run.total - run.picked.length,
		);
		await finishBatch(run.title, [...run.picked, ...rest], true, run.targets);
	}, [availableParticipants, finishBatch]);

	// A winner of the multi-winner reveal did not show up: void them and fill just
	// that slot with a new pick (same gift when gifts are on). The new pick is
	// saved on its own, not as part of the original draw's round.
	const redrawBatchSlot = useCallback(
		async (index: number) => {
			const absent = batchWinners?.[index];
			if (!batchWinners || !absent) return;
			const voided = await luckyDraw.voidWinner(absent);
			if (!voided) return;

			const taken = new Set(batchWinners.map((w) => w.publicId));
			const [pick] = pickRandomWinners(
				latest.current.availableParticipants.filter(
					(p) => !taken.has(p.publicId),
				),
				1,
			);
			if (!pick) {
				toast.error("No one left to draw");
				return;
			}
			const saved = voided.giftId
				? await assignWinners(String(voided.giftId), [pick], useTicket)
				: await addInvalidParticipants([pick], useTicket);
			if (saved) {
				setBatchWinners(
					(current) => current?.map((w, i) => (i === index ? pick : w)) ?? null,
				);
			}
		},
		[batchWinners, luckyDraw, assignWinners, addInvalidParticipants, useTicket],
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
			isFullscreen,
			toggleFullscreen,
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
			winnersPerDraw,
			batchSize,
			isBatchDraw,

			// Actions
			handleDraw,
			handleDrawComplete,
			handleBatchComplete,
			batchWinners,
			batchTitle,
			batchGiftNames,
			batchPicked,
			batchTotal,
			batchSkipped,
			skipBatch,
			redrawBatchSlot,
			clearBatchWinners: () => setBatchWinners(null),
			luckyDraw,
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
			winnersPerDraw,
			batchSize,
			isBatchDraw,
			handleDraw,
			handleDrawComplete,
			handleBatchComplete,
			batchWinners,
			batchTitle,
			batchGiftNames,
			batchPicked,
			batchTotal,
			batchSkipped,
			skipBatch,
			redrawBatchSlot,
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
