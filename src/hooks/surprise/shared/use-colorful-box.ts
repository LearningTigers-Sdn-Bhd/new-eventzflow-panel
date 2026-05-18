"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DrawProps } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";

const SHAKE_DURATION_MS = 4000;
const OPEN_DELAY_MS = 500;

export interface UseColorfulBoxReturn {
	isEmpty: boolean;
	isOpen: boolean;
	isAnimating: boolean;
	containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useColorfulBox({
	participants,
	prizes,
	mode = "participants",
	onDrawComplete,
	isDrawing,
	isCelebrating,
}: DrawProps): UseColorfulBoxReturn {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	// Determine which data source to use
	const isPrizesMode = mode === "prizes";
	const items = isPrizesMode
		? (prizes || []).flatMap((p) => {
				const count = p.remaining ?? p.quantity ?? 1;
				const safeCount = Math.max(1, count);
				return Array(safeCount).fill(p);
			})
		: participants || [];

	const prevIsDrawingRef = useRef(false);
	const prevIsCelebratingRef = useRef(false);
	const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const startDraw = useCallback(() => {
		setIsAnimating(true);
		setIsOpen(false);

		// Shake for a duration, then open
		shakeTimeoutRef.current = setTimeout(() => {
			setIsAnimating(false);

			// Select random winner
			const randomIndex = Math.floor(Math.random() * items.length);
			const selectedWinner = items[randomIndex];

			// Open lid after short delay
			openTimeoutRef.current = setTimeout(() => {
				setIsOpen(true);
				onDrawComplete(selectedWinner);
			}, OPEN_DELAY_MS);
		}, SHAKE_DURATION_MS);
	}, [items, onDrawComplete]);

	// Handle drawing state changes
	useEffect(() => {
		if (isDrawing && !prevIsDrawingRef.current && items.length > 0) {
			startDraw();
		}
		prevIsDrawingRef.current = isDrawing;
	}, [isDrawing, items.length, startDraw]);

	// Handle celebration end - close the box
	useEffect(() => {
		const celebrating = isCelebrating ?? false;

		if (!celebrating && prevIsCelebratingRef.current && isOpen) {
			setIsOpen(false);
		}
		prevIsCelebratingRef.current = celebrating;
	}, [isCelebrating, isOpen]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (shakeTimeoutRef.current) {
				clearTimeout(shakeTimeoutRef.current);
			}
			if (openTimeoutRef.current) {
				clearTimeout(openTimeoutRef.current);
			}
		};
	}, []);

	const isEmpty = items.length === 0;

	return {
		isEmpty,
		isOpen,
		isAnimating,
		containerRef,
	};
}
