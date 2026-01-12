/**
 * Scan History Hook
 *
 * Production-ready scan history management:
 * - Fetches recent check-ins from backend on mount
 * - Maintains session state for new scans
 * - Combines backend data with session scans
 * - No localStorage bloat - backend is source of truth
 */

import { useCallback, useEffect, useState } from "react";
import type { ScanResult } from "@/components/pages/scan/types";
import { getRecentCheckIns } from "@/lib/api/scan";

const MAX_HISTORY_SIZE = 100;

export function useScanHistory(eventId?: number) {
	const [scanResults, setScanResults] = useState<ScanResult[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * Fetch recent check-ins from backend on mount
	 */
	useEffect(() => {
		let isMounted = true;

		async function fetchHistory() {
			try {
				setIsLoading(true);

				const checkIns = await getRecentCheckIns({
					eventId,
					limit: MAX_HISTORY_SIZE,
				});

				if (!isMounted) return;

				// Convert RecentCheckIn to ScanResult format
				const results: ScanResult[] = checkIns.map((item) => ({
					scanId: item.scanId,
					timestamp: item.timestamp,
					status: item.status,
					message: `${item.type === "visitor" ? "Visitor" : "Ticket"} checked in`,
					type: item.type,
					name: item.name,
					email: item.email,
					phone: item.phone,
					eventName: item.eventName,
					eventId: item.eventId,
					checkedIn: item.checkedIn,
					checkInAt: item.checkInAt,
					ticketType: item.ticketType,
					ticketValue: item.ticketValue,
					gender: item.gender,
					age: item.age,
				}));

				setScanResults(results);
			} catch (err) {
				if (!isMounted) return;
				console.error("Failed to fetch scan history:", err);
				// Keep empty array on error - don't break the UI
				setScanResults([]);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		fetchHistory();

		return () => {
			isMounted = false;
		};
	}, [eventId]);

	/**
	 * Add a new scan result to history
	 * New scans are added at the beginning (most recent first)
	 */
	const addScanResult = useCallback((result: ScanResult) => {
		setScanResults((prev) => {
			// Check for duplicate
			const exists = prev.find((item) => item.scanId === result.scanId);
			if (exists) {
				return prev;
			}
			// Add new result at the beginning, limit size
			const updated = [result, ...prev];
			return updated.slice(0, MAX_HISTORY_SIZE);
		});
	}, []);

	return {
		scanResults,
		isLoading,
		addScanResult,
	};
}
