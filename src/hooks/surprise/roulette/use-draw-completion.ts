"use client";

import { useCallback } from "react";
import type { Prize } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import type {
	RouletteParticipant,
	RouletteSession,
} from "@/lib/api/roulette/response";
import type { ParticipantQueueItem } from "@/stores/roulette-participant-queue-store";

interface UseDrawCompletionParams {
	session: RouletteSession;
	queue: ParticipantQueueItem[];
	getCurrentParticipant: () => ParticipantQueueItem | null;
	decrementDraws: (index: number) => void;
	removeParticipant: (index: number) => void;
	createWinner: (
		participant: RouletteParticipant,
		prize: Prize,
	) => Promise<void>;
	stopDrawing: () => void;
	onCelebrationStart: (participant: RouletteParticipant, prize: Prize) => void;
}

/**
 * Hook to handle draw completion logic
 * Manages queue updates after a draw completes and handles winner creation
 */
export function useDrawCompletion({
	session,
	queue,
	getCurrentParticipant,
	decrementDraws,
	removeParticipant,
	createWinner,
	stopDrawing,
	onCelebrationStart,
}: UseDrawCompletionParams) {
	// Helper function to update queue after draw completion
	const updateQueueAfterDraw = useCallback(
		(
			currentIndex: number,
			currentParticipant: ReturnType<typeof getCurrentParticipant>,
		) => {
			if (!currentParticipant) return;

			// Check if multiple draws are enabled and participant has remaining draws
			if (session.is_multiple && currentParticipant.remainingDraws > 1) {
				// Decrement draw count
				decrementDraws(currentIndex);
			} else {
				// Remove participant from queue
				// Note: removeParticipant already handles index adjustment automatically
				removeParticipant(currentIndex);
			}
		},
		[session.is_multiple, decrementDraws, removeParticipant],
	);

	// Handle draw completion
	const handleDrawComplete = useCallback(
		async (selectedPrize: Prize) => {
			const currentParticipant = getCurrentParticipant();
			if (!currentParticipant) {
				console.error("No current participant available");
				stopDrawing();
				return;
			}

			try {
				// Create winner with current participant and selected prize
				await createWinner(currentParticipant.participant, selectedPrize);

				// Handle draw counts and queue management
				const currentIndex = queue.findIndex(
					(item: ParticipantQueueItem) =>
						item.participant.publicId ===
						currentParticipant.participant.publicId,
				);

				if (currentIndex === -1) {
					console.error("Participant not found in queue");
					stopDrawing();
					return;
				}

				updateQueueAfterDraw(currentIndex, currentParticipant);
				onCelebrationStart(currentParticipant.participant, selectedPrize);
			} catch (error) {
				// Error already handled in createWinner
				console.error("Error creating winner:", error);
			} finally {
				// Always stop drawing after animation
				stopDrawing();
			}
		},
		[
			getCurrentParticipant,
			createWinner,
			queue,
			updateQueueAfterDraw,
			onCelebrationStart,
			stopDrawing,
		],
	);

	return {
		handleDrawComplete,
	};
}
