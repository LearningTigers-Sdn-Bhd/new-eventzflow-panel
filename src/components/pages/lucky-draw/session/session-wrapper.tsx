"use client";

import { format } from "date-fns";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialog } from "@/hooks/use-dialog";
import { useLuckyDraw } from "@/hooks/use-lucky-draw";
import {
	getLuckyDrawSessionBackgroundUrl,
	getLuckyDrawSessionLogoUrl,
} from "@/lib/api/lucky-draw";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import type { Participant } from "@/stores/lucky-draw-store";
import { WinnerDialogContent } from "../winner-dialog-content";
import { BoxDraw } from "./draw-styles/box-draw";
import { SlotDraw } from "./draw-styles/slot-draw";
import WheelDrawNew from "./draw-styles/wheel-draw";
import { ConfigSheet } from "./sheets/config-sheet";
import { GiftInvalidListSheet } from "./sheets/gift-invalid-list-sheet";
import { ParticipantsSheet } from "./sheets/participants-sheet";

interface LuckyDrawWrapperProps {
	eventId: string;
	sessionId: number;
	session: LuckyDrawSession;
	eventName: string;
}

export function LuckyDrawWrapper({
	eventId,
	sessionId,
	session,
	eventName,
}: LuckyDrawWrapperProps) {
	const router = useRouter();
	const { openDialog, closeDialog, isOpen } = useDialog();
	const [participantSheetOpen, setParticipantSheetOpen] = useState(false);
	const [configSheetOpen, setConfigSheetOpen] = useState(false);
	const [giftSheetOpen, setGiftSheetOpen] = useState(false);
	const [drawResetKey, setDrawResetKey] = useState(0);
	const [shouldCelebrate, setShouldCelebrate] = useState(false);
	const winnerModalTimeoutRef = useRef<number | null>(null);
	const prevIsOpen = useRef(false);

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

	const handleDraw = () => {
		if (canDraw && availableParticipants.length > 0) {
			startDrawing();
		}
	};

	const handleDrawComplete = async (winner: Participant) => {
		let success = false;
		try {
			if (useGifts) {
				if (nextAvailableGift) {
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
			setShouldCelebrate(true);

			// Wait a bit after the animation finishes before showing the modal
			if (winnerModalTimeoutRef.current) {
				clearTimeout(winnerModalTimeoutRef.current);
			}
			winnerModalTimeoutRef.current = window.setTimeout(() => {
				openDialog({
					component: WinnerDialogContent,
					props: {
						winner,
						onClose: closeDialog,
						effectType: "side-cannons",
					},
					config: {
						size: "lg",
					},
				});

				// Reset draw style state after showing the modal
				setDrawResetKey((prev) => prev + 1);
			}, 1500);
		}
	};

	useEffect(() => {
		return () => {
			if (winnerModalTimeoutRef.current) {
				clearTimeout(winnerModalTimeoutRef.current);
			}
		};
	}, []);

	// Reset celebration when a new draw starts
	useEffect(() => {
		if (isDrawing && shouldCelebrate) {
			// New draw started - reset celebration state
			setShouldCelebrate(false);
		}
	}, [isDrawing, shouldCelebrate]);

	// Stop celebration when modal closes (transition back to idle)
	useEffect(() => {
		// Only reset celebration when modal transitions from open to closed
		if (prevIsOpen.current === true && !isOpen && shouldCelebrate) {
			// Modal closed - stop celebration and return to idle
			setShouldCelebrate(false);
		}
		prevIsOpen.current = isOpen;
	}, [isOpen, shouldCelebrate]);

	// Celebration state: active when drawing is finished (starts immediately) and continues until modal closes
	const isCelebrating = shouldCelebrate;

	const renderDrawComponent = () => {
		// Show loading state while essential data loads
		if (isLoadingConfig) {
			return (
				<div className="flex h-96 items-center justify-center">
					<Skeleton className="h-full w-full max-w-md" />
				</div>
			);
		}

		switch (drawStyle) {
			case "wheel":
				return (
					<WheelDrawNew
						key={`wheel-${drawResetKey}`}
						participants={availableParticipants}
						onDrawComplete={handleDrawComplete}
						isDrawing={isDrawing}
						isCelebrating={isCelebrating}
						theme={drawTheme}
					/>
				);
			case "slot":
				return (
					<SlotDraw
						key={`slot-${drawResetKey}`}
						participants={availableParticipants}
						onDrawComplete={handleDrawComplete}
						isDrawing={isDrawing}
						isCelebrating={isCelebrating}
						theme={drawTheme}
					/>
				);
			case "box":
				return (
					<BoxDraw
						key={`box-${drawResetKey}`}
						participants={availableParticipants}
						onDrawComplete={handleDrawComplete}
						isDrawing={isDrawing}
						isCelebrating={isCelebrating}
						theme={drawTheme}
					/>
				);
			default:
				return null;
		}
	};

	// Calculate background style
	const backgroundStyle = useMemo(() => {
		if (!wrapperBackground) return {};
		if (wrapperBackground.useImage && wrapperBackground.backgroundImgUrl) {
			return {
				backgroundImage: `url(${getLuckyDrawSessionBackgroundUrl(
					wrapperBackground.backgroundImgUrl,
				)})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			};
		}
		if (!wrapperBackground.useImage && wrapperBackground.backgroundColor) {
			return {
				backgroundColor: wrapperBackground.backgroundColor,
			};
		}
		return {};
	}, [wrapperBackground]);

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6">
			{/* Header Row */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push(`/event/${eventId}/lucky-draw`)}
						className="gap-2 rounded-none"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="text-sm">Back</span>
					</Button>
				</div>

				{/* Session Info */}
				<div className="flex flex-1 items-center justify-center gap-4">
					<div className="flex flex-col items-center">
						{session.logo && (
							<div className="relative mb-1 size-14 overflow-hidden">
								<img
									src={getLuckyDrawSessionLogoUrl(session.logo)}
									alt={session.title}
									className="h-full w-full object-cover"
								/>
							</div>
						)}
						<h1 className="font-bold text-xl">{session.title}</h1>
						{session.draw_date && (
							<span className="text-muted-foreground text-xs">
								{format(new Date(session.draw_date), "PPP")}
							</span>
						)}
					</div>
				</div>

				{/* Controls */}
				<div className="grid grid-cols-2 items-end gap-2">
					<ParticipantsSheet
						open={participantSheetOpen}
						onOpenChange={setParticipantSheetOpen}
						luckyDraw={luckyDraw}
					/>
					<ConfigSheet
						open={configSheetOpen}
						onOpenChange={setConfigSheetOpen}
						luckyDraw={luckyDraw}
					/>
					<GiftInvalidListSheet
						open={giftSheetOpen}
						onOpenChange={setGiftSheetOpen}
						luckyDraw={luckyDraw}
					/>
					<Button
						size="sm"
						onClick={handleDraw}
						disabled={!canDraw || isDrawing}
						className="flex w-full items-center justify-start gap-2 rounded-none"
					>
						<Download className="size-4" />
						{isDrawing ? "Drawing..." : "Draw"}
					</Button>
				</div>
			</div>

			{/* Draw Area */}
			<div
				className="flex h-screen flex-1 flex-col items-center justify-center rounded-none border bg-card p-0 md:p-6"
				style={backgroundStyle}
			>
				<div className="flex h-[75%] w-full flex-col items-center justify-center">
					{renderDrawComponent()}
				</div>
			</div>

			{/* Draw Button */}
			<div className="flex justify-center pb-12" />
		</div>
	);
}
