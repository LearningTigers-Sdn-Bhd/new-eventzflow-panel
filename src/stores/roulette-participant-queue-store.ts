"use client";

import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { RouletteParticipant } from "@/lib/api/roulette/response";

/**
 * Roulette Participant Queue Store
 *
 * Manages the participant queue for roulette draws.
 * Each queue item tracks the participant and their remaining draw counts.
 */
export interface ParticipantQueueItem {
	participant: RouletteParticipant;
	remainingDraws: number;
}

interface RouletteParticipantQueueState {
	// Queue state
	queue: ParticipantQueueItem[];
	currentParticipantIndex: number | null;

	// Actions
	addParticipant: (
		participant: RouletteParticipant,
		initialDraws: number,
	) => void;
	removeParticipant: (index: number) => void;
	decrementDraws: (index: number) => void;
	reorderQueue: (newOrder: ParticipantQueueItem[]) => void;
	clearQueue: () => void;
	setCurrentParticipantIndex: (index: number | null) => void;
	getCurrentParticipant: () => ParticipantQueueItem | null;
}

const rouletteParticipantQueueStoreSlice: StateCreator<
	RouletteParticipantQueueState
> = (set, get) => ({
	queue: [],
	currentParticipantIndex: null,

	addParticipant: (participant, initialDraws) => {
		set((state) => ({
			queue: [
				...state.queue,
				{
					participant,
					remainingDraws: initialDraws,
				},
			],
		}));
	},

	removeParticipant: (index) => {
		set((state) => {
			const newQueue = state.queue.filter((_, i) => i !== index);
			// Adjust current index if needed
			let newCurrentIndex = state.currentParticipantIndex;
			if (state.currentParticipantIndex !== null) {
				if (index < state.currentParticipantIndex) {
					// Removed item was before current, decrement index
					newCurrentIndex = state.currentParticipantIndex - 1;
				} else if (index === state.currentParticipantIndex) {
					// Removed current participant, reset to null or next
					newCurrentIndex = newQueue.length > 0 ? 0 : null;
				}
				// If removed item was after current, no change needed
			}
			return {
				queue: newQueue,
				currentParticipantIndex: newCurrentIndex,
			};
		});
	},

	decrementDraws: (index) => {
		set((state) => {
			const newQueue = [...state.queue];
			if (newQueue[index]) {
				newQueue[index] = {
					...newQueue[index],
					remainingDraws: Math.max(0, newQueue[index].remainingDraws - 1),
				};
			}
			return { queue: newQueue };
		});
	},

	reorderQueue: (newOrder) => {
		set({ queue: newOrder });
	},

	clearQueue: () => {
		set({ queue: [], currentParticipantIndex: null });
	},

	setCurrentParticipantIndex: (index) => {
		set({ currentParticipantIndex: index });
	},

	getCurrentParticipant: () => {
		const state = get();
		if (state.currentParticipantIndex === null) {
			return null;
		}
		return state.queue[state.currentParticipantIndex] || null;
	},
});

export const useRouletteParticipantQueueStore = create(
	persist(rouletteParticipantQueueStoreSlice, {
		name: "roulette-participant-queue-storage",
	}),
);
