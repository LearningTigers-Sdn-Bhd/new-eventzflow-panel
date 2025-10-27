/**
 * Scan Utility Functions
 * Filtering, sorting, exporting, and audio feedback utilities
 */

import { toast } from "sonner";
import type { ScanResult, FilterType, SortType } from "./types";
import { AUDIO_CONFIG, SUCCESS_MESSAGES, ERROR_MESSAGES } from "./constants";

// NOTE: Actual validation is now done via tRPC in scanner-card.tsx
// This file only contains utility functions for filtering, sorting, and exporting

/**
 * Play audio feedback for scan result
 */
export function playBeep(success: boolean) {
	try {
		const audioContext = new (window.AudioContext ||
			(window as any).webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.frequency.value = success 
			? AUDIO_CONFIG.SUCCESS_FREQUENCY 
			: AUDIO_CONFIG.ERROR_FREQUENCY;
		oscillator.type = AUDIO_CONFIG.OSCILLATOR_TYPE;

		gainNode.gain.setValueAtTime(AUDIO_CONFIG.GAIN, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			audioContext.currentTime + AUDIO_CONFIG.DURATION,
		);

		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + AUDIO_CONFIG.DURATION);
	} catch (err) {
		console.error("Audio error:", err);
	}
}

/**
 * Filter and sort scan results
 */
export function filterAndSortResults(
	results: ScanResult[],
	searchQuery: string,
	filterType: FilterType,
	sortType: SortType,
): ScanResult[] {
	return results
		.filter((result) => {
			// Apply event filter
			if (filterType !== "all" && result.eventId?.toString() !== filterType) return false;

			// Apply search
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					result.ticketId.toLowerCase().includes(query) ||
					result.attendeeName?.toLowerCase().includes(query) ||
					result.attendeeEmail?.toLowerCase().includes(query) ||
					result.attendeePhone?.toLowerCase().includes(query) ||
					result.ticketType?.toLowerCase().includes(query) ||
					result.seatNumber?.toLowerCase().includes(query) ||
					result.eventName?.toLowerCase().includes(query)
				);
			}

			return true;
		})
		.sort((a, b) => {
			switch (sortType) {
				case "newest":
					return b.timestamp.getTime() - a.timestamp.getTime();
				case "oldest":
					return a.timestamp.getTime() - b.timestamp.getTime();
				case "status":
					return a.status.localeCompare(b.status);
				default:
					return 0;
			}
		});
}

/**
 * Export scan results to CSV file
 */
export function exportToCSV(results: ScanResult[]) {
	if (results.length === 0) {
		toast.error(ERROR_MESSAGES.NO_DATA_TO_EXPORT);
		return;
	}

	const csv = [
		["Ticket ID", "Status", "Attendee Name", "Email", "Phone", "Ticket Type", "Seat", "Value", "Checked In", "Timestamp"].join(
			",",
		),
		...results.map((r) =>
			[
				r.ticketId,
				r.status,
				r.attendeeName || "",
				r.attendeeEmail || "",
				r.attendeePhone || "",
				r.ticketType || "",
				r.seatNumber || "",
				r.ticketValue || "",
				r.checkedIn ? "Yes" : "No",
				r.timestamp.toISOString(),
			].join(","),
		),
	].join("\n");

	const blob = new Blob([csv], { type: "text/csv" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `ticket-scans-${Date.now()}.csv`;
	a.click();
	URL.revokeObjectURL(url);

	toast.success(SUCCESS_MESSAGES.EXPORT_SUCCESS, {
		description: `${results.length} scans exported`,
	});
}
