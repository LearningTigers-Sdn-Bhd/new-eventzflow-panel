"use client";

import { DrawComponent } from "@/components/pages/surprise-mechanics/shared/components/draw-component";
import { SessionDrawArea } from "@/components/pages/surprise-mechanics/shared/components/session-draw-area";
import { SessionFullscreenToggle } from "@/components/pages/surprise-mechanics/shared/components/session-header";
import { DrawProvider } from "@/components/pages/surprise-mechanics/shared/contexts/draw-context";
import type { Prize } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Participant } from "@/stores/lucky-draw-store";
import { useLuckyDrawSession } from "../session-provider";
import { BatchResults } from "./batch-results";

export function LuckyDrawDrawArea() {
	const {
		session,
		availableParticipants,
		nextAvailableGift,
		drawStyle,
		drawTheme,
		useGifts,
		isDrawing,
		isCelebrating,
		drawResetKey,
		backgroundStyle,
		handleDrawComplete,
		handleBatchComplete,
		handleDraw,
		isBatchDraw,
		batchWinners,
		batchTitle,
		batchGiftNames,
		batchPicked,
		batchTotal,
		batchSkipped,
		skipBatch,
		clearBatchWinners,
		isLoadingConfig,
		isFullscreen,
		toggleFullscreen,
	} = useLuckyDrawSession();

	// Each quick round draws from the people not yet picked in this multi-winner draw
	const roundParticipants =
		batchPicked.length > 0
			? availableParticipants.filter(
					(p) => !batchPicked.some((x) => x.publicId === p.publicId),
				)
			: availableParticipants;

	// Wrapper function to adapt handleDrawComplete signature
	// DrawContext expects (winner: Participant | Prize) but handleDrawComplete only accepts Participant
	// In lucky-draw mode, we only deal with participants, so we can safely cast
	const handleDrawCompleteWrapper = async (winner: Participant | Prize) => {
		// In lucky-draw mode (participants mode), winner will always be Participant
		// Prize type doesn't have 'type' and 'publicId' properties that Participant has
		if ("type" in winner && "publicId" in winner) {
			// The style plays once; with several winners per draw its winner is the
			// first of the batch and the rest are picked and saved together.
			if (isBatchDraw) {
				await handleBatchComplete(winner as Participant);
			} else {
				await handleDrawComplete(winner as Participant);
			}
		} else {
			// This should never happen in lucky-draw mode, but handle it gracefully
			console.warn("Received Prize in lucky-draw mode, expected Participant");
		}
	};

	return (
		<DrawProvider
			value={{
				drawStyle,
				drawTheme,
				participants: roundParticipants,
				mode: "participants",
				isDrawing,
				isCelebrating,
				drawResetKey,
				onDrawComplete: handleDrawCompleteWrapper,
				onDraw: handleDraw,
				quick: isBatchDraw,
				useGifts,
				hasAvailableGift: !!nextAvailableGift,
				isLoading: isLoadingConfig,
			}}
		>
			<SessionDrawArea
				session={session}
				backgroundStyle={backgroundStyle}
				className={cn(
					"flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden rounded-none border bg-card p-0 transition-all duration-300 md:p-6",
					isFullscreen ? "h-screen w-full" : "aspect-video w-full max-w-7xl",
				)}
				drawComponent={<DrawComponent />}
				overlay={
					<>
						{batchTotal > 0 && (
							<div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background/85 py-1.5 pr-1.5 pl-5 font-semibold text-sm tabular-nums shadow-md backdrop-blur-sm">
								Drawing winners · {batchPicked.length} / {batchTotal}
								<Button
									size="sm"
									variant="secondary"
									className="h-7 rounded-full px-3"
									onClick={skipBatch}
								>
									Skip animation
								</Button>
							</div>
						)}
						{batchWinners && (
							<BatchResults
								winners={batchWinners}
								title={batchTitle}
								giftNames={batchGiftNames}
								suspense={batchSkipped}
								pool={availableParticipants}
								onClose={clearBatchWinners}
							/>
						)}
					</>
				}
				fullscreenToggle={
					<SessionFullscreenToggle
						isFullscreen={isFullscreen}
						onToggle={toggleFullscreen}
						isOverlay
					/>
				}
			/>
		</DrawProvider>
	);
}
