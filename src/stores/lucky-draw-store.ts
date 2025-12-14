"use client";

import { create, type StateCreator } from "zustand";

// Export types for backward compatibility with components
export type Participant = {
	name: string;
	type: "ticket" | "visitor";
	publicId: string;
};

export type Gift = {
	id: string;
	name: string;
	order: number;
	winner_counts: number;
	winner: Participant | null;
	actual_winner_count?: number; // Actual number of winners assigned
	allWinners?: Array<Participant & { id: number }>; // All winners for collapsible display
};

export type DrawStyle = "wheel" | "slot" | "box";
export type DrawTheme = "wireframe" | "colorful" | "cartoon";
export type DrawStyles = {
	style: DrawStyle;
	theme: DrawTheme;
};

/**
 * Lucky Draw Store - UI State Only
 *
 * This store ONLY manages UI state (isDrawing, eventId, eventName).
 * Data (participants, gifts, invalidParticipants) is managed by TanStack Query
 * and consumed directly from the useLuckyDraw hook.
 *
 * IMPORTANT: Do NOT store server data here. Use TanStack Query for that.
 */
interface LuckyDrawState {
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

const luckyDrawStoreSlice: StateCreator<LuckyDrawState> = (set) => ({
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
export const useLuckyDrawStore = create(luckyDrawStoreSlice);
