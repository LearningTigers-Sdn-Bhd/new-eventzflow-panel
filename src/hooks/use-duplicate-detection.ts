/**
 * Duplicate Detection Hook
 * Manages duplicate ticket detection with debouncing
 */

import { useRef, useCallback } from "react";
import { SCANNER_CONFIG } from "@/components/pages/scan/constants";

interface UseDuplicateDetectionOptions {
	debounceTimeMs?: number;
}

export function useDuplicateDetection(options: UseDuplicateDetectionOptions = {}) {
	const { debounceTimeMs = SCANNER_CONFIG.DEBOUNCE_TIME_MS } = options;
	
	const lastScannedCodeRef = useRef<string>("");
	const lastScannedTimeRef = useRef<number>(0);

	/**
	 * Check if a ticket ID is a duplicate scan (same code scanned recently)
	 */
	const isDuplicateScan = useCallback(
		(ticketId: string): boolean => {
			const now = Date.now();
			const isSameCodeRecently =
				ticketId === lastScannedCodeRef.current &&
				now - lastScannedTimeRef.current < debounceTimeMs;

			return isSameCodeRecently;
		},
		[debounceTimeMs]
	);

	/**
	 * Mark a ticket as scanned (update refs)
	 */
	const markAsScanned = useCallback((ticketId: string) => {
		lastScannedCodeRef.current = ticketId;
		lastScannedTimeRef.current = Date.now();
	}, []);

	/**
	 * Check and mark in one operation
	 */
	const checkAndMark = useCallback(
		(ticketId: string): boolean => {
			if (isDuplicateScan(ticketId)) {
				return true;
			}
			markAsScanned(ticketId);
			return false;
		},
		[isDuplicateScan, markAsScanned]
	);

	return {
		isDuplicateScan,
		markAsScanned,
		checkAndMark,
	};
}
