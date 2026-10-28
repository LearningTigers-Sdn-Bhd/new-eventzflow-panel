"use client";

import { ScanLine } from "lucide-react";
import {
	SessionBackButton,
	SessionDisplayModeToggle,
	SessionDrawButton,
	SessionFullscreenToggle,
	SessionHeader,
	SessionHeaderActions,
	SessionHeaderCenter,
	SessionHeaderMenu,
	SessionInfo,
} from "@/components/pages/surprise-mechanics/shared/components/session-header";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { EntryScanner } from "../../entry/entry-scanner";
import { useLuckyDrawSession } from "../session-provider";
import { ConfigSheet } from "../sheets/config-sheet";
import { GiftInvalidListSheet } from "../sheets/gift-invalid-list-sheet";
import { ParticipantsSheet } from "../sheets/participants-sheet";

export function LuckyDrawHeader() {
	const { openDialog } = useDialog();
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
					{session.scanned_source === "entries" && (
						<Button
							variant="outline"
							size="sm"
							className="gap-2 rounded-none"
							onClick={() =>
								openDialog({
									component: EntryScanner,
									props: { eventId, sessionId: session.id },
									config: {
										title: "Scan Participants",
										size: "md",
										showCloseButton: true,
									},
								})
							}
						>
							<ScanLine className="size-4" />
							Scan Participants
						</Button>
					)}
					<SessionFullscreenToggle
						isFullscreen={isFullscreen}
						onToggle={toggleFullscreen}
					/>
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
