"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DrawProps } from "@/components/pages/lucky-draw/session/draw-styles/type";
import { DrawState } from "@/components/pages/lucky-draw/session/draw-styles/type";

export type ReelItem = {
	id: string;
	label: string;
};

// Config for the animation
const ITEM_HEIGHT = 80; // height of each name item in pixels
const VISIBLE_ITEMS = 3; // Show 3 items: Top, Center (Winner), Bottom
export const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPIN_DURATION_MS = 2500; // slightly faster for snappiness
const MIN_SPIN_CYCLES = 25;

export interface UseSlotReturn {
	state: DrawState;
	reel: ReelItem[];
	offsetY: number;
	isTransitioning: boolean;
	isEmpty: boolean;
	spinDurationMs: number;
	itemHeight: number;
}

export function useSlot({
	participants,
	onDrawComplete,
	isDrawing,
}: DrawProps): UseSlotReturn {
	const [state, setState] = useState<DrawState>(DrawState.IDLE);
	const [reel, setReel] = useState<ReelItem[]>([]);
	const [offsetY, setOffsetY] = useState<number>(0);
	const prevIsDrawingRef = useRef(false);

	// Track the last winner to ensure continuity between spins
	const lastWinnerRef = useRef<string>("???");
	const idCounterRef = useRef(0);

	const [isTransitioning, setIsTransitioning] = useState(false);

	const createItem = useCallback((label: string, prefix: string): ReelItem => {
		const id = `${prefix}-${idCounterRef.current++}`;
		return { id, label };
	}, []);

	const getRandomName = useCallback(() => {
		if (participants.length === 0) return "???";
		const randomIndex = Math.floor(Math.random() * participants.length);
		return participants[randomIndex].name;
	}, [participants]);

	// Helper to generate a sequence of names with minimal repetition (deck shuffle style)
	const generateReelSequence = useCallback(
		(count: number, excludeStart?: string) => {
			if (participants.length === 0) return Array(count).fill("???");

			const sequence: string[] = [];
			// Create a pool of indices to draw from
			let pool = participants.map((_, i) => i);

			// Shuffle the pool initially
			pool.sort(() => Math.random() - 0.5);

			// Keep track of recently added items to enforce distance
			// If we have >= 3 participants, we want min distance of 2 (A, B, C, A...)
			// If we have 2 participants, min distance 1 (A, B, A...)
			const minDistance = participants.length >= 3 ? 2 : 1;
			const banned: string[] = excludeStart ? [excludeStart] : [];

			for (let i = 0; i < count; i++) {
				// Find a candidate that isn't in the banned list
				let candidateIndex = -1;

				if (participants.length === 1) {
					candidateIndex = 0;
				} else {
					// Try to find a candidate from the current pool not in banned list
					const poolIndex = pool.findIndex(
						(pIndex) => !banned.includes(participants[pIndex].name),
					);

					if (poolIndex !== -1) {
						// Found one in pool
						candidateIndex = pool[poolIndex];
						// Remove from pool
						pool.splice(poolIndex, 1);
					} else {
						// Pool exhausted or all remaining are banned
						// Refill pool with ALL indices
						pool = participants.map((_, idx) => idx);
						// Shuffle again
						pool.sort(() => Math.random() - 0.5);

						// Try again from fresh pool
						const newPoolIndex = pool.findIndex(
							(pIndex) => !banned.includes(participants[pIndex].name),
						);
						if (newPoolIndex !== -1) {
							candidateIndex = pool[newPoolIndex];
							pool.splice(newPoolIndex, 1);
						} else {
							// If still nothing (shouldn't happen if N > banned.length), pick first available
							// This is a fallback for extreme edge cases
							candidateIndex = pool[0];
							pool.shift();
						}
					}
				}

				const name = participants[candidateIndex].name;
				sequence.push(name);

				// Update banned list
				banned.push(name);
				if (banned.length > minDistance) {
					banned.shift(); // Remove oldest
				}
			}
			return sequence;
		},
		[participants],
	);

	// Initialize: Set up a static view with the "last winner" in the center
	useEffect(() => {
		if (state === DrawState.IDLE && reel.length === 0) {
			// Initial view: [Random, StartName, Random]
			// This places 'StartName' in the middle slot (index 1)
			const startName = participants.length > 0 ? participants[0].name : "???";
			lastWinnerRef.current = startName;

			// Generate unique neighbors
			// We want [Top, Center, Bottom]. Center is startName.
			// We need Top != Center, and Bottom != Center, and ideally Top != Bottom.

			// Generate sequence starting with 'startName' as banned
			// get 2 items: [N1, N2]
			// Use N1 for Top, N2 for Bottom.
			const neighbors = generateReelSequence(2, startName);

			setReel([
				createItem(neighbors[0], "initial"),
				createItem(startName, "initial"),
				createItem(neighbors[1], "initial"),
			]);
			setOffsetY(0); // 0 offset puts index 0 at top, index 1 at center.
		}
	}, [participants, state, reel.length, generateReelSequence, createItem]);

	const handleSpin = useCallback(() => {
		if (state === DrawState.SPINNING || participants.length === 0) return;

		// 1. Determine Winner
		const winnerIndex = Math.floor(Math.random() * participants.length);
		const selectedWinner = participants[winnerIndex];

		// 2. Build the Reel
		// Structure: [PrevTop, StartName, ...Randoms, Winner, NextBottom]
		// We keep the first 2 items identical to current view to prevent visual jumping
		// StartName is at Index 1.
		const startName = lastWinnerRef.current;

		// Get current top item (visual continuity) - although usually off-screen or just noise
		// Ideally we want continuity. reel[0] is the top item.
		const prevTopName = reel.length > 0 ? reel[0].label : getRandomName();

		// Create new strip
		const newReel: ReelItem[] = [
			createItem(prevTopName, "noise"), // Indices 0, 1 matches current view
			createItem(startName, "start"),
		];

		// Add noise sequence
		// We generate noise sequence starting after 'startName'
		const noiseSequence = generateReelSequence(MIN_SPIN_CYCLES, startName);

		noiseSequence.forEach((name) => {
			newReel.push(createItem(name, "noise"));
		});

		// Add Winner
		newReel.push(createItem(selectedWinner.name, "winner"));

		// Add one item AFTER winner to fill the bottom slot
		// Ensure it's different from winner
		const tailName = generateReelSequence(1, selectedWinner.name)[0];
		newReel.push(createItem(tailName, "tail"));

		// 3. Calculate target offset
		// Winner is at index: newReel.length - 2
		// We want Winner to be in the Middle Slot (2nd visible slot).
		// The Container shows items at scrollTop.
		// To center Item I, scrollTop = (I * H) - (1 * H) = (I - 1) * H.
		const winnerIdx = newReel.length - 2;
		const targetOffset = (winnerIdx - 1) * ITEM_HEIGHT;

		// 4. Execute Spin
		setReel(newReel);
		setState(DrawState.SPINNING);
		setOffsetY(0); // Reset to top (matches visual start state)
		setIsTransitioning(false);

		// Force reflow/render before animating
		setTimeout(() => {
			setIsTransitioning(true);
			setOffsetY(targetOffset);
		}, 20);

		// 5. Cleanup
		setTimeout(() => {
			setState(DrawState.WON);
			lastWinnerRef.current = selectedWinner.name;
			setIsTransitioning(false);

			// Optional: Trim the reel back down to 3 items [Top, Winner, Bottom]
			// to save memory if user keeps spinning without refresh.
			// For now, keeping it long is fine for simplicity.

			onDrawComplete(selectedWinner);
		}, SPIN_DURATION_MS);
	}, [
		state,
		participants,
		createItem,
		getRandomName,
		onDrawComplete,
		generateReelSequence,
		reel,
	]);

	// Auto-trigger spin when wrapper toggles drawing state
	useEffect(() => {
		if (isDrawing && !prevIsDrawingRef.current) {
			handleSpin();
		}
		prevIsDrawingRef.current = isDrawing;
	}, [isDrawing, handleSpin]);

	const isEmpty = participants.length === 0;

	return {
		state,
		reel,
		offsetY,
		isTransitioning,
		isEmpty,
		spinDurationMs: SPIN_DURATION_MS,
		itemHeight: ITEM_HEIGHT,
	};
}
