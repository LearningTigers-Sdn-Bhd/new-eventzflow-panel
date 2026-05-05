/**
 * Scan Feature Constants
 * Centralized configuration for all magic numbers and hardcoded values
 */

import type { ScanInvalidReason } from "@/lib/api/scan";

// Scanner Configuration
export const SCANNER_CONFIG = {
	SCANNER_DIV_ID: "qr-reader",
	FPS: 10,
	QRBOX_SIZE: 256,
	ASPECT_RATIO: 1.0,
	DEBOUNCE_TIME_MS: 2000, // Prevent scanning same code within 2 seconds
	STOP_DELAY_MS: 300, // Delay after stopping scanner
} as const;

// UI Timing
export const UI_TIMING = {
	RECENT_SCAN_DISPLAY_MS: 3000, // How long to highlight recent scan
	MAX_RECENT_SCANS: 10, // Number of recent scans to display
} as const;

// Storage Configuration
export const STORAGE_CONFIG = {
	SCAN_HISTORY_KEY: "scan_history",
	MAX_HISTORY_ITEMS: 1000, // Keep last 1000 scans
	OFFLINE_EVENTS_KEY: "offline_events",
	OFFLINE_TICKETS_KEY: "offline_tickets",
	OFFLINE_LAST_SYNCED_KEY: "offline_last_synced",
} as const;

// Scanner States (Html5Qrcode library states)
export const SCANNER_STATES = {
	NOT_STARTED: 1,
	SCANNING: 2,
	PAUSED: 3,
} as const;

// Status Variants for UI
export const STATUS_VARIANTS = {
	success: {
		bg: "bg-green-50 dark:bg-green-950/20",
		border: "border-green-200 dark:border-green-900/30",
		iconBg: "bg-green-500/20",
		badgeBg:
			"bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
		text: "text-green-600",
		label: "Valid",
	},
	error: {
		bg: "bg-red-50 dark:bg-red-950/20",
		border: "border-red-200 dark:border-red-900/30",
		iconBg: "bg-red-500/20",
		badgeBg: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
		text: "text-red-600",
		label: "Invalid",
	},
	duplicate: {
		bg: "bg-yellow-50 dark:bg-yellow-950/20",
		border: "border-yellow-200 dark:border-yellow-900/30",
		iconBg: "bg-yellow-500/20",
		badgeBg:
			"bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
		text: "text-yellow-600",
		label: "Duplicate",
	},
} as const;

// Error Messages
export const ERROR_MESSAGES = {
	CAMERA_PERMISSION_DENIED: "Camera permission denied",
	CAMERA_START_FAILED: "Failed to start camera",
	CAMERA_PERMISSION_HELP: "Please check your camera permissions",
	DUPLICATE_SCAN_SESSION: "Already scanned in this session",
	DUPLICATE_SCAN_BACKEND: "Already checked in",
	INVALID_TICKET: "Record not found or network error",
	SCAN_HISTORY_LOAD_FAILED: "Failed to load scan history",
	SCAN_HISTORY_SAVE_FAILED: "Failed to save scan history",
	SCAN_HISTORY_CLEAR_FAILED: "Failed to clear scan history",
	NO_DATA_TO_EXPORT: "No data to export",
	SYNC_DATA_FAILED: "Failed to sync data",
	CLEAR_DATA_FAILED: "Failed to clear data",
} as const;

export const SCAN_INVALID_REASON_MESSAGES: Record<ScanInvalidReason, string> = {
	wrong_event: "This ticket belongs to a different event.",
	outside_event_days: "This event is not active today.",
	wrong_day: "This ticket is not valid for today.",
	already_checked_in_today: "This ticket has already been checked in today.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
	CAMERA_ACTIVATED: "Camera activated",
	CAMERA_READY: "Ready to scan tickets",
	CAMERA_STOPPED: "Camera stopped",
	TICKET_VALID: "Valid Ticket ✓",
	TICKET_CHECKED_IN: "Ticket checked in successfully",
	DATA_SYNCED: "Data synced successfully",
	DATA_CLEARED: "Offline data cleared",
	HISTORY_CLEARED: "All scans cleared",
	EXPORT_SUCCESS: "Exported successfully",
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
	SUCCESS_FREQUENCY: 800,
	ERROR_FREQUENCY: 400,
	GAIN: 0.3,
	DURATION: 0.2,
	OSCILLATOR_TYPE: "sine" as OscillatorType,
} as const;
