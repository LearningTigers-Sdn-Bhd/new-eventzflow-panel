/**
 * Scan History Hook
 *
 * Fetches and manages scan history from both:
 * 1. Backend: All tickets scanned by current user across all their events
 * 2. Local: Recent scans from this session (before backend sync)
 *
 * How it works:
 * - On mount: Fetches all tickets scanned by user from backend
 * - On new scan: Shows immediately in local state, then syncs with backend
 * - Success scans: Persisted to backend, shown permanently
 * - Error/duplicate scans: Shown for 5 seconds, then removed (not persisted)
 */

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { ScanResult } from "@/components/pages/scan/types";
import { getMyScannedTickets } from "@/lib/api/ticket";

export function useScanHistory() {
	// Local scans: temporary storage for scans from this session
	const [localScans, setLocalScans] = useState<ScanResult[]>([]);

	// Backend scans: all tickets scanned by this user (across all events)
	const {
		data: backendTickets = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["scanned-tickets"],
		queryFn: () => getMyScannedTickets(1000), // Get last 1000 scanned tickets
	});

	/**
	 * Transform backend tickets to ScanResult format and merge with local scans
	 * Memoized to prevent infinite re-renders
	 */
	const scanResults = useMemo(() => {
		const allScans: ScanResult[] = [
			// First, show local scans (scans from this session that might not be in backend yet)
			...localScans,
			// Then, show backend tickets (already scanned tickets from database)
			...backendTickets.map((ticket) => ({
				ticketId: ticket.id,
				timestamp: ticket.checkInAt
					? new Date(ticket.checkInAt)
					: new Date(ticket.createdAt || Date.now()),
				status: "success" as const,
				message: "Valid ticket - Checked in successfully",
				attendeeName: ticket.name,
				attendeeEmail: ticket.email,
				attendeePhone: ticket.phone || undefined,
				ticketType: ticket.ticketTypeName,
				ticketValue: ticket.value,
				seatNumber: ticket.customLabels?.find((l) =>
					l.name.toLowerCase().includes("seat"),
				)?.value,
				checkedIn: ticket.checkedIn,
				checkInAt: ticket.checkInAt,
				eventName: ticket.eventName,
				eventId: ticket.eventId
					? Number.parseInt(ticket.eventId, 10)
					: undefined,
			})),
		];

		// Remove duplicates (if a ticket exists in both local and backend)
		const uniqueScans = allScans.reduce((acc, current) => {
			const exists = acc.find((item) => item.ticketId === current.ticketId);
			if (!exists) {
				acc.push(current);
			}
			return acc;
		}, [] as ScanResult[]);

		// Sort by timestamp (newest first)
		uniqueScans.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

		return uniqueScans;
	}, [localScans, backendTickets]);

	/**
	 * Add a new scan result to local history
	 * This will be shown immediately while waiting for backend sync
	 */
	const addScanResult = useCallback(
		(result: ScanResult) => {
			// Always add to local scans for immediate UI feedback
			setLocalScans((prev) => {
				// Add new result at the beginning
				const newResults = [result, ...prev];
				return newResults;
			});

			// Handle based on scan status
			if (result.status === "success") {
				// Successful scan: Refetch backend to get the ticket from DB
				// Use a small delay to give backend time to process the check-in
				setTimeout(() => {
					refetch().then(() => {
						// Clear this local scan once it's confirmed in the backend
						setLocalScans((prev) =>
							prev.filter((s) => s.ticketId !== result.ticketId),
						);
					});
				}, 1000); // Increased to 1s for better reliability
			} else {
				// Error/duplicate scans: Keep in local state for 5 seconds then remove
				// These are not persisted to backend, so they should disappear after display
				setTimeout(() => {
					setLocalScans((prev) =>
						prev.filter((s) => s.ticketId !== result.ticketId),
					);
				}, 5000);
			}
		},
		[refetch],
	);

	/**
	 * Clear all scan history
	 * This only clears local scans; backend history is permanent
	 */
	const clearHistory = useCallback(() => {
		setLocalScans([]);
		// Note: Backend scanned tickets are permanent and cannot be cleared from frontend
		// They represent actual check-ins that have occurred
	}, []);

	/**
	 * Get statistics from scan history
	 */
	const getStats = useCallback(() => {
		const total = scanResults.length;
		const successful = scanResults.filter((r) => r.status === "success").length;
		const duplicates = scanResults.filter(
			(r) => r.status === "duplicate",
		).length;
		const errors = scanResults.filter((r) => r.status === "error").length;

		return {
			total,
			successful,
			duplicates,
			errors,
		};
	}, [scanResults]);

	return {
		scanResults,
		isLoading,
		addScanResult,
		clearHistory,
		getStats,
		refetch, // Export refetch for manual refresh
	};
}
