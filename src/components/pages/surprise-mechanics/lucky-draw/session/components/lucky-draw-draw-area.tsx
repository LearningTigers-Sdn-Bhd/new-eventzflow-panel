"use client";

import { DrawComponent } from "@/components/pages/surprise-mechanics/shared/components/draw-component";
import { SessionDrawArea } from "@/components/pages/surprise-mechanics/shared/components/session-draw-area";
import { SessionFullscreenToggle } from "@/components/pages/surprise-mechanics/shared/components/session-header";
import { DrawProvider } from "@/components/pages/surprise-mechanics/shared/contexts/draw-context";
import { cn } from "@/lib/utils";
import type { Prize } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import type { Participant } from "@/stores/lucky-draw-store";
import { useLuckyDrawSession } from "../session-provider";

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
		handleDraw,
		isLoadingConfig,
		isFullscreen,
		toggleFullscreen,
	} = useLuckyDrawSession();

	// Wrapper function to adapt handleDrawComplete signature
	// DrawContext expects (winner: Participant | Prize) but handleDrawComplete only accepts Participant
	// In lucky-draw mode, we only deal with participants, so we can safely cast
	const handleDrawCompleteWrapper = async (winner: Participant | Prize) => {
		// In lucky-draw mode (participants mode), winner will always be Participant
		// Prize type doesn't have 'type' and 'publicId' properties that Participant has
		if ("type" in winner && "publicId" in winner) {
			await handleDrawComplete(winner as Participant);
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
				participants: availableParticipants,
				mode: "participants",
				isDrawing,
				isCelebrating,
				drawResetKey,
				onDrawComplete: handleDrawCompleteWrapper,
				onDraw: handleDraw,
				useGifts,
				hasAvailableGift: !!nextAvailableGift,
				isLoading: isLoadingConfig,
			}}
		>
			<SessionDrawArea
				session={session}
				backgroundStyle={backgroundStyle}
				className={cn(
					"flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden rounded-none border bg-card p-0 md:p-6 transition-all duration-300",
					isFullscreen ? "h-screen w-full" : "aspect-video w-full max-w-7xl"
				)}
				drawComponent={<DrawComponent />}
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
