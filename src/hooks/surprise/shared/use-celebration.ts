"use client";

import { useEffect, useRef, useState } from "react";
import { CELEBRATION_DURATION_MS } from "@/lib/constants/surprise";

/**
 * Hook to manage celebration state and timeout
 * Handles celebration animation and automatic reset
 */
export function useCelebration() {
	const [shouldCelebrate, setShouldCelebrate] = useState(false);
	const [drawResetKey, setDrawResetKey] = useState(0);
	const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const startCelebration = () => {
		setShouldCelebrate(true);
		// Clear any existing timeout
		if (celebrationTimeoutRef.current) {
			clearTimeout(celebrationTimeoutRef.current);
		}
		// Set new timeout
		celebrationTimeoutRef.current = setTimeout(() => {
			setShouldCelebrate(false);
			setDrawResetKey((prev: number) => prev + 1);
			celebrationTimeoutRef.current = null;
		}, CELEBRATION_DURATION_MS);
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (celebrationTimeoutRef.current) {
				clearTimeout(celebrationTimeoutRef.current);
			}
		};
	}, []);

	return {
		shouldCelebrate,
		drawResetKey,
		startCelebration,
	};
}
