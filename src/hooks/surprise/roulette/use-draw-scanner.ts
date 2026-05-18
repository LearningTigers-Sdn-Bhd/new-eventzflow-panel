"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDuplicateDetection } from "@/hooks/use-duplicate-detection";
import { useScanner } from "@/hooks/use-scanner";
import { getRouletteParticipant } from "@/lib/api/roulette";
import type { RouletteParticipant } from "@/lib/api/roulette/response";

interface UseDrawScannerOptions {
	eventId: string;
	sessionId: number;
	onScanSuccess?: (participant: RouletteParticipant) => void;
	validateScan?: (
		participant: RouletteParticipant,
	) => string | null | undefined | false;
}

const SCANNER_CONFIG = {
	SCANNER_DIV_ID: "roulette-draw-scanner",
	FPS: 10,
	QRBOX_SIZE: { width: 250, height: 250 },
	ASPECT_RATIO: 1.0,
	STOP_DELAY_MS: 100,
};

export function useDrawScanner({
	eventId,
	sessionId,
	onScanSuccess,
	validateScan,
}: UseDrawScannerOptions) {
	const [isScanning, setIsScanning] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [scannedParticipants, setScannedParticipants] = useState<
		RouletteParticipant[]
	>([]);
	const scannedParticipantsRef = useRef<RouletteParticipant[]>([]);

	// Sync ref with state
	useEffect(() => {
		scannedParticipantsRef.current = scannedParticipants;
	}, [scannedParticipants]);

	const [scanError, setScanError] = useState<string | null>(null);
	const _scannedIdsRef = useRef<Set<string>>(new Set());
	const failedScansRef = useRef<Set<string>>(new Set());
	const { checkAndMark, markAsScanned } = useDuplicateDetection();
	const stopScannerRef = useRef<(() => Promise<boolean>) | null>(null);

	// Scanner hook - initialize first
	const { startScanner: startScannerHook, stopScanner: stopScannerHook } =
		useScanner({
			scannerId: SCANNER_CONFIG.SCANNER_DIV_ID,
			onScanSuccess: async (decodedText: string) => {
				const cleanDecodedText = decodedText.trim();

				// 1. Check if we already have this participant in the list
				if (
					scannedParticipantsRef.current.some(
						(p) => p.publicId === cleanDecodedText,
					)
				) {
					return;
				}

				// Check if this scan has already failed (prevent infinite retries)
				if (failedScansRef.current.has(cleanDecodedText)) {
					return;
				}

				if (checkAndMark(cleanDecodedText)) {
					// Silent ignore for debounced scans
					return;
				}

				try {
					const participantInfo = await getRouletteParticipant(
						eventId,
						sessionId,
						cleanDecodedText,
					);

					// Optional validation
					if (validateScan) {
						const validationError = validateScan(participantInfo);
						if (validationError) {
							setScanError(validationError);
							// Add to failed scans to prevent immediate retry
							failedScansRef.current.add(cleanDecodedText);
							markAsScanned(cleanDecodedText);
							return;
						}
					}

					// Backend already validates that participant belongs to the event,
					// so if we get here, the participant is valid
					setScannedParticipants((prev) => [...prev, participantInfo]);
					setScanError(null);
					// Remove from failed scans if it was there
					failedScansRef.current.delete(cleanDecodedText);

					// Call optional success callback
					if (onScanSuccess) {
						onScanSuccess(participantInfo);
					}

					// Log successful scan for debugging/tracking
					console.debug(
						`Participant scanned for draw: eventId=${eventId}, sessionId=${sessionId}, participantId=${participantInfo.id}`,
					);
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Failed to scan participant";

					// Check if this is a 403 Forbidden error
					// ky HTTPError has response.status property
					let isForbidden = false;
					if (error && typeof error === "object" && "response" in error) {
						const httpError = error as { response?: Response };
						const status = httpError.response?.status;
						isForbidden = status === 403;
					}
					// Also check error message for "Forbidden" or "authorized" keywords
					const messageLower = message.toLowerCase();
					if (
						messageLower.includes("forbidden") ||
						messageLower.includes("not authorized") ||
						messageLower.includes("403")
					) {
						isForbidden = true;
					}

					// Mark this scan as failed to prevent immediate retries
					failedScansRef.current.add(cleanDecodedText);
					// Also mark in duplicate detection with longer cooldown
					markAsScanned(cleanDecodedText);

					// Stop scanner on 403 errors to prevent infinite loop
					if (isForbidden && stopScannerRef.current) {
						await stopScannerRef.current();
						setScanError(
							"Not authorized to check in this participant. Please contact an administrator.",
						);
					} else {
						setScanError(message);
					}
				}
			},
		});

	const stopScanner = useCallback(async () => {
		setIsTransitioning(true);
		const success = await stopScannerHook();
		if (success) {
			setIsScanning(false);
		}
		setIsTransitioning(false);
		return success;
	}, [stopScannerHook]);

	// Store stopScanner in ref for use in onScanSuccess
	stopScannerRef.current = stopScanner;

	const startScanner = useCallback(async () => {
		setIsTransitioning(true);
		setScanError(null);
		// Clear failed scans when starting a new scan session
		failedScansRef.current.clear();
		const success = await startScannerHook();
		if (success) {
			setIsScanning(true);
		}
		setIsTransitioning(false);
		return success;
	}, [startScannerHook]);

	const clearScanned = useCallback(() => {
		setScannedParticipants([]);
		setScanError(null);
	}, []);

	const removeScanned = useCallback((index: number) => {
		setScannedParticipants((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const retry = useCallback(() => {
		setScanError(null);
		// Clear failed scans to allow retry
		failedScansRef.current.clear();
		if (!isScanning) {
			startScanner();
		}
	}, [isScanning, startScanner]);

	// Cleanup scanner on unmount
	useEffect(() => {
		return () => {
			stopScannerHook().catch(console.error);
		};
	}, [stopScannerHook]);

	return {
		scannerId: SCANNER_CONFIG.SCANNER_DIV_ID,
		isScanning,
		isTransitioning,
		scannedParticipants,
		scanError,
		startScanner,
		stopScanner,
		clearScanned,
		removeScanned,
		retry,
	};
}
