"use client";

import { useState } from "react";

/**
 * Hook to manage all session sheet states
 * Consolidates sheet states for both roulette and lucky-draw sessions
 */
export function useSessionSheets() {
	// Roulette sheets
	const [prizeConfigSheetOpen, setPrizeConfigSheetOpen] = useState(false);
	const [drawSettingsSheetOpen, setDrawSettingsSheetOpen] = useState(false);
	const [participantQueueSheetOpen, setParticipantQueueSheetOpen] =
		useState(false);

	// Lucky Draw sheets
	const [configSheetOpen, setConfigSheetOpen] = useState(false);
	const [participantsSheetOpen, setParticipantsSheetOpen] = useState(false);
	const [giftInvalidListSheetOpen, setGiftInvalidListSheetOpen] =
		useState(false);

	return {
		// Roulette sheets
		prizeConfig: {
			open: prizeConfigSheetOpen,
			onOpenChange: setPrizeConfigSheetOpen,
		},
		drawSettings: {
			open: drawSettingsSheetOpen,
			onOpenChange: setDrawSettingsSheetOpen,
		},
		participantQueue: {
			open: participantQueueSheetOpen,
			onOpenChange: setParticipantQueueSheetOpen,
		},
		// Lucky Draw sheets
		config: {
			open: configSheetOpen,
			onOpenChange: setConfigSheetOpen,
		},
		participants: {
			open: participantsSheetOpen,
			onOpenChange: setParticipantsSheetOpen,
		},
		giftInvalidList: {
			open: giftInvalidListSheetOpen,
			onOpenChange: setGiftInvalidListSheetOpen,
		},
	};
}
