"use client";

import { create, type StateCreator } from "zustand";

/**
 * Prize Roulette Store - UI State Only
 *
 * This store ONLY manages UI state (isDrawing, eventId, sessionId, eventName).
 * Data (prizes, winners, session) is managed by TanStack Query
 * and consumed directly from the usePrizeRoulette hook.
 *
 * IMPORTANT: Do NOT store server data here. Use TanStack Query for that.
 */
interface PrizeRouletteState {
	// UI state only
	eventId: string | null;
	sessionId: number | null;
	eventName: string | null;
	isDrawing: boolean;

	// Actions
	setEventId: (eventId: string) => void;
	setSessionId: (sessionId: number) => void;
	setEventName: (eventName: string) => void;
	setDrawingState: (isDrawing: boolean) => void;
}

const prizeRouletteStoreSlice: StateCreator<PrizeRouletteState> = (set) => ({
	eventId: null,
	sessionId: null,
	eventName: null,
	isDrawing: false,

	setEventId: (eventId) => set({ eventId }),
	setSessionId: (sessionId) => set({ sessionId }),
	setEventName: (eventName) => set({ eventName }),
	setDrawingState: (isDrawing) => set({ isDrawing }),
});

// Store without persist middleware - UI state only, no data storage
export const usePrizeRouletteStore = create(prizeRouletteStoreSlice);
