"use client";

import { DrawComponent } from "@/components/pages/surprise-mechanics/shared/components/draw-component";
import { SessionDrawArea } from "@/components/pages/surprise-mechanics/shared/components/session-draw-area";
import { DrawProvider } from "@/components/pages/surprise-mechanics/shared/contexts/draw-context";
import type { Prize } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import type { Participant } from "@/stores/lucky-draw-store";
import { useRouletteSession } from "../session-provider";

export function RouletteDrawArea() {
	const {
		session,
		drawStyle,
		drawTheme,
		availablePrizes,
		isDrawing,
		isCelebrating,
		drawResetKey,
		backgroundStyle,
		handleDrawComplete,
		handleOpenDrawDialog,
	} = useRouletteSession();

	// Wrapper function to adapt handleDrawComplete signature
	// DrawContext expects (winner: Participant | Prize) but handleDrawComplete only accepts Prize
	// In roulette mode (prizes mode), we only deal with prizes, so we can safely cast
	const handleDrawCompleteWrapper = async (winner: Participant | Prize) => {
		// In roulette mode (prizes mode), winner will always be Prize
		// Prize type has 'id' and 'quantity' properties that Participant doesn't have
		if ("id" in winner && "quantity" in winner) {
			await handleDrawComplete(winner as Prize);
		} else {
			// This should never happen in roulette mode, but handle it gracefully
			console.warn("Received Participant in roulette mode, expected Prize");
		}
	};

	return (
		<div className="lg:col-span-2">
			<DrawProvider
				value={{
					drawStyle,
					drawTheme,
					prizes: availablePrizes,
					mode: "prizes",
					isDrawing,
					isCelebrating,
					drawResetKey,
					onDrawComplete: handleDrawCompleteWrapper,
					onDraw: handleOpenDrawDialog,
				}}
			>
				<SessionDrawArea
					session={session}
					backgroundStyle={backgroundStyle}
					drawComponent={<DrawComponent />}
				/>
			</DrawProvider>
		</div>
	);
}
