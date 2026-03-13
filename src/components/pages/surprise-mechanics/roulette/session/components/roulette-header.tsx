"use client";

import { User, UserPlus } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useRouletteSession } from "../session-provider";
import { DrawSettingsSheet } from "../sheets/draw-settings-sheet";
import { ParticipantQueueSheet } from "../sheets/participant-queue-sheet";
import { PrizeConfigSheet } from "../sheets/prize-config-sheet";

export function RouletteHeader() {
	const {
		eventId,
		sessionId,
		session,
		eventName,
		isDisplayMode,
		toggleDisplayMode,
		isFullscreen,
		toggleFullscreen,
		sheetState,
		canDraw,
		isDrawing,
		handleOpenDrawDialog,
		handleOpenAddParticipantDialog,
		clearQueue,
	} = useRouletteSession();

	return (
		<SessionHeader>
			<SessionInfo eventName={eventName} session={session} />
			<SessionHeaderMenu>
				<SessionBackButton route={`/event/${eventId}/prize-roulette`} />
				<SessionHeaderCenter>
					{isDisplayMode ? (
						<div className="flex items-center gap-2">
							<SessionDisplayModeToggle
								isDisplayMode={isDisplayMode}
								onToggle={toggleDisplayMode}
							/>
							<PrizeConfigSheet
								open={sheetState.prizeConfig.open}
								onOpenChange={sheetState.prizeConfig.onOpenChange}
								eventId={eventId}
								sessionId={sessionId}
							/>
							<DrawSettingsSheet
								open={sheetState.drawSettings.open}
								onOpenChange={sheetState.drawSettings.onOpenChange}
								eventId={eventId}
								sessionId={sessionId}
								session={session}
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={handleOpenAddParticipantDialog}
								className="gap-2 rounded-none"
							>
								<UserPlus className="h-4 w-4" />
								<span className="hidden text-sm md:block">Add</span>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => sheetState.participantQueue.onOpenChange(true)}
								className="gap-2 rounded-none"
							>
								<User className="h-4 w-4" />
								<span className="hidden text-sm md:block">View</span>
							</Button>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<SessionDisplayModeToggle
								isDisplayMode={isDisplayMode}
								onToggle={toggleDisplayMode}
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={() => sheetState.participantQueue.onOpenChange(true)}
								className="gap-2 rounded-none"
							>
								<User className="h-4 w-4" />
								<span className="hidden text-sm md:block">View</span>
							</Button>
						</div>
					)}
				</SessionHeaderCenter>
				<SessionHeaderActions>
					<ParticipantQueueSheet
						open={sheetState.participantQueue.open}
						onOpenChange={sheetState.participantQueue.onOpenChange}
						onClearQueue={clearQueue}
					/>
					<SessionDrawButton
						onClick={handleOpenDrawDialog}
						disabled={!canDraw || isDrawing}
						isDrawing={isDrawing}
					/>
				</SessionHeaderActions>
			</SessionHeaderMenu>
		</SessionHeader>
	);
}
