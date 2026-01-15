/**
 * Scan Utility Functions
 * Audio feedback and export utilities
 */

import { toast } from "sonner";
import { AUDIO_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";
import type { ScanResult } from "./types";

/**
 * Play audio feedback for scan result
 */
export function playBeep(success: boolean) {
	try {
		const audioContext = new (
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext
		)();
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
 * Export scan results to CSV file
 */
export function exportToCSV(results: ScanResult[]) {
	if (results.length === 0) {
		toast.error(ERROR_MESSAGES.NO_DATA_TO_EXPORT);
		return;
	}

	const csv = [
		[
			"Scan ID",
			"Type",
			"Role",
			"Status",
			"Name",
			"Email",
			"Phone",
			"Ticket Type",
			"Value",
			"Checked In",
			"Timestamp",
		].join(","),
		...results.map((r) =>
			[
				r.scanId,
				r.type || "ticket",
				r.role || "",
				r.status,
				r.name || "",
				r.email || "",
				r.phone || "",
				r.ticketType || "",
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
