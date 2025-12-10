"use client";

import { create } from "zustand";

/**
 * Lid state enum for the 3D gift box
 */
export enum LidState {
	CLOSED = "CLOSED",
	OPEN = "OPEN",
}

/**
 * Box rotation state interface
 */
export interface BoxRotation {
	x: number;
	y: number;
}

/**
 * Box draw store state
 */
interface BoxDrawStore {
	// Lid state
	lidState: LidState;
	setLidState: (state: LidState) => void;

	// Box rotation
	boxRotation: BoxRotation;
	setBoxRotation: (rotation: BoxRotation) => void;

	// Reset all state to defaults
	reset: () => void;
}

const IDLE_ROTATION: BoxRotation = { x: 0, y: 45 };

/**
 * Zustand store for managing 3D box draw state
 */
export const useBoxDrawStore = create<BoxDrawStore>((set) => ({
	// Initial state
	lidState: LidState.CLOSED,
	boxRotation: IDLE_ROTATION,

	// Actions
	setLidState: (state) => set({ lidState: state }),
	setBoxRotation: (rotation) => set({ boxRotation: rotation }),

	// Reset to idle state
	reset: () =>
		set({
			lidState: LidState.CLOSED,
			boxRotation: IDLE_ROTATION,
		}),
}));
