"use client";

import {
	SessionBackButton,
	SessionDisplayModeToggle,
	SessionDrawButton,
	SessionHeader,
	SessionHeaderActions,
	SessionHeaderCenter,
	SessionHeaderMenu,
	SessionInfo,
} from "@/components/pages/surprise-mechanics/shared/components/session-header";
import { useLuckyDrawSession } from "../session-provider";
import { ConfigSheet } from "../sheets/config-sheet";
import { GiftInvalidListSheet } from "../sheets/gift-invalid-list-sheet";
import { ParticipantsSheet } from "../sheets/participants-sheet";

export function LuckyDrawHeader() {
	const {
		eventId,
		session,
		eventName,
		isDisplayMode,
		toggleDisplayMode,
		isFullscreen,
		toggleFullscreen,
		sheetState,
		canDraw,
		isDrawing,
		handleDraw,
		luckyDraw,
	} = useLuckyDrawSession();

	return (
		<SessionHeader>
			<SessionInfo eventName={eventName} session={session} />
			<SessionHeaderMenu>
				<SessionBackButton route={`/event/${eventId}/lucky-draw`} />
				<SessionHeaderCenter>
					{isDisplayMode ? (
						<>
							<SessionDisplayModeToggle
								isDisplayMode={isDisplayMode}
								onToggle={toggleDisplayMode}
							/>
							<ParticipantsSheet
								open={sheetState.participants.open}
								onOpenChange={sheetState.participants.onOpenChange}
								luckyDraw={luckyDraw}
							/>
							<ConfigSheet
								open={sheetState.config.open}
								onOpenChange={sheetState.config.onOpenChange}
								luckyDraw={luckyDraw}
							/>
							<GiftInvalidListSheet
								open={sheetState.giftInvalidList.open}
								onOpenChange={sheetState.giftInvalidList.onOpenChange}
								luckyDraw={luckyDraw}
								eventId={eventId}
								sessionId={session.id}
							/>
						</>
					) : (
						<SessionDisplayModeToggle
							isDisplayMode={isDisplayMode}
							onToggle={toggleDisplayMode}
						/>
					)}
				</SessionHeaderCenter>
				<SessionHeaderActions>
					<SessionDrawButton
						onClick={handleDraw}
						disabled={!canDraw || isDrawing}
						isDrawing={isDrawing}
					/>
				</SessionHeaderActions>
			</SessionHeaderMenu>
		</SessionHeader>
	);
}
