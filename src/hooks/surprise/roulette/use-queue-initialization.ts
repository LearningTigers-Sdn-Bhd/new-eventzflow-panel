"use client";

import { useEffect } from "react";
import { useRouletteParticipantQueueStore } from "@/stores/roulette-participant-queue-store";

/**
 * Hook to initialize current participant index when queue changes
 * Ensures the first participant is set as current when queue is populated
 */
export function useQueueInitialization() {
	const queue = useRouletteParticipantQueueStore((state) => state.queue);

	useEffect(() => {
		const store = useRouletteParticipantQueueStore.getState();
		if (queue.length > 0) {
			const current = store.getCurrentParticipant();
			if (!current) {
				// Set first participant as current
				store.setCurrentParticipantIndex(0);
			}
		} else {
			// Queue is empty, clear current index
			store.setCurrentParticipantIndex(null);
		}
	}, [queue.length]);
}
