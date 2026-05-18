"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
	DrawProps,
	Prize,
} from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import { DrawState } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import type { Participant } from "@/stores/lucky-draw-store";

export type ReelItem = {
	id: string;
	label: string;
};

// Type for items in the slot machine (can be either prize or participant)
type SlotItem =
	| { name: string; id: string | number; prize: Prize }
	| { name: string; id: string; participant: Participant };

// Config for the animation
const ITEM_HEIGHT = 80; // height of each name item in pixels
const VISIBLE_ITEMS = 3; // Show 3 items: Top, Center (Winner), Bottom
export const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPIN_DURATION_MS = 5500; // Even longer for maximum suspense
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
	prizes,
	mode = "participants",
	onDrawComplete,
	isDrawing,
}: DrawProps): UseSlotReturn {
	const [state, setState] = useState<DrawState>(DrawState.IDLE);
	const [reel, setReel] = useState<ReelItem[]>([]);
	const [offsetY, setOffsetY] = useState<number>(0);
	const prevIsDrawingRef = useRef(false);

	// Determine which data source to use
	const isPrizesMode = mode === "prizes";
	const items = isPrizesMode
		? (prizes || []).flatMap((p) => {
				const count = p.remaining ?? p.quantity ?? 1;
				const safeCount = Math.max(1, count);
				return Array.from({ length: safeCount }).map((_, i) => ({
					name: p.name,
					id: `${p.id}-${i}`, // Use string ID to match SlotItem type if needed, but SlotItem id is number?
					// Wait, SlotItem definition:
					// | { name: string; id: number; prize: Prize }
					// | { name: string; id: string; participant: Participant };
					// Prize ID is number. Here I'm making it string.
					// I need to check SlotItem type usage.
					// 'id' is used in 'items' array.
					// 'createItem' generates new ID for ReelItem.
					// 'items' elements are stored in 'lastWinnerItemRef.current'.
					// 'items' elements are used to pick 'selectedItem'.
					// 'selectedItem.id' isn't explicitly used for logic other than identity maybe?
					// Let's check SlotItem type again.
					prize: p,
				}));
			})
		: (participants || []).map((p) => ({
				name: p.name,
				id: p.publicId,
				participant: p,
			}));

	// Track the last winner to ensure continuity between spins
	const lastWinnerRef = useRef<string>("???");
	const lastWinnerItemRef = useRef<SlotItem | null>(null);
	const idCounterRef = useRef(0);

	const [isTransitioning, setIsTransitioning] = useState(false);

	const createItem = useCallback((label: string, prefix: string): ReelItem => {
		const id = `${prefix}-${idCounterRef.current++}`;
		return { id, label };
	}, []);

	const getRandomName = useCallback(() => {
		if (items.length === 0) return "???";
		const randomIndex = Math.floor(Math.random() * items.length);
		return items[randomIndex].name;
	}, [items]);

	// Helper to generate a sequence of names with minimal repetition (deck shuffle style)
	const generateReelSequence = useCallback(
		(count: number, excludeStart?: string) => {
			if (items.length === 0) return Array(count).fill("???");

			const sequence: string[] = [];
			// Create a pool of indices to draw from
			let pool = items.map((_, i) => i);

			// Shuffle the pool initially
			pool.sort(() => Math.random() - 0.5);

			// Keep track of recently added items to enforce distance
			// If we have >= 3 items, we want min distance of 2 (A, B, C, A...)
			// If we have 2 items, min distance 1 (A, B, A...)
			const minDistance = items.length >= 3 ? 2 : 1;
			const banned: string[] = excludeStart ? [excludeStart] : [];

			for (let i = 0; i < count; i++) {
				// Find a candidate that isn't in the banned list
				let candidateIndex = -1;

				if (items.length === 1) {
					candidateIndex = 0;
				} else {
					// Try to find a candidate from the current pool not in banned list
					const poolIndex = pool.findIndex(
						(pIndex) => !banned.includes(items[pIndex].name),
					);

					if (poolIndex !== -1) {
						// Found one in pool
						candidateIndex = pool[poolIndex];
						// Remove from pool
						pool.splice(poolIndex, 1);
					} else {
						// Pool exhausted or all remaining are banned
						// Refill pool with ALL indices
						pool = items.map((_, idx) => idx);
						// Shuffle again
						pool.sort(() => Math.random() - 0.5);

						// Try again from fresh pool
						const newPoolIndex = pool.findIndex(
							(pIndex) => !banned.includes(items[pIndex].name),
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

				const name = items[candidateIndex].name;
				sequence.push(name);

				// Update banned list
				banned.push(name);
				if (banned.length > minDistance) {
					banned.shift(); // Remove oldest
				}
			}
			return sequence;
		},
		[items],
	);

	// Initialize: Set up a static view with the "last winner" in the center
	useEffect(() => {
		if (state === DrawState.IDLE && reel.length === 0) {
			// Initial view: [Random, StartName, Random]
			// This places 'StartName' in the middle slot (index 1)
			const startName = items.length > 0 ? items[0].name : "???";
			lastWinnerRef.current = startName;
			lastWinnerItemRef.current = items.length > 0 ? items[0] : null;

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
	}, [items, state, reel.length, generateReelSequence, createItem]);

	const handleSpin = useCallback(() => {
		if (state === DrawState.SPINNING || items.length === 0) return;

		// 1. Determine Winner
		const winnerIndex = Math.floor(Math.random() * items.length);
		const selectedItem = items[winnerIndex];
		const selectedWinner =
			"prize" in selectedItem ? selectedItem.prize : selectedItem.participant;

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
			lastWinnerRef.current = selectedItem.name;
			lastWinnerItemRef.current = selectedItem;
			setIsTransitioning(false);

			// Optional: Trim the reel back down to 3 items [Top, Winner, Bottom]
			// to save memory if user keeps spinning without refresh.
			// For now, keeping it long is fine for simplicity.

			onDrawComplete(selectedWinner);
		}, SPIN_DURATION_MS);
	}, [
		state,
		items,
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

	const isEmpty = items.length === 0;

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
