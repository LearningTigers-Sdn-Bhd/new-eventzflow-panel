/**
 * QR Scanner Hook
 * Manages QR code scanner lifecycle and state
 */

import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	ERROR_MESSAGES,
	SCANNER_CONFIG,
	SCANNER_STATES,
	SUCCESS_MESSAGES,
} from "@/components/pages/scan/constants";

interface UseScannerOptions {
	scannerId?: string;
	onScanSuccess: (decodedText: string) => void;
	onScanError?: (errorMessage: string) => void;
}

export function useScanner({
	scannerId = SCANNER_CONFIG.SCANNER_DIV_ID,
	onScanSuccess,
	onScanError,
}: UseScannerOptions) {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const isTransitioningRef = useRef<boolean>(false);

	/**
	 * Check if scanner is currently active
	 */
	const isActive = useCallback((): boolean => {
		if (!scannerRef.current) return false;

		try {
			const state = scannerRef.current.getState();
			return (
				state === SCANNER_STATES.SCANNING || state === SCANNER_STATES.PAUSED
			);
		} catch {
			return false;
		}
	}, []);

	/**
	 * Stop the scanner if it's running
	 */
	const stopIfRunning = useCallback(async () => {
		if (!scannerRef.current) return;

		try {
			const state = scannerRef.current.getState();
			if (
				state === SCANNER_STATES.SCANNING ||
				state === SCANNER_STATES.PAUSED
			) {
				await scannerRef.current.stop();
				// Wait for scanner to fully stop
				await new Promise((resolve) =>
					setTimeout(resolve, SCANNER_CONFIG.STOP_DELAY_MS),
				);
			}
		} catch (error) {
			console.error("Error stopping scanner:", error);
		}
	}, []);

	/**
	 * Start the scanner
	 */
	const startScanner = useCallback(async () => {
		// Prevent multiple rapid clicks
		if (isTransitioningRef.current || isActive()) {
			console.log("Scanner already transitioning or active");
			return false;
		}

		isTransitioningRef.current = true;

		try {
			// Clean up existing scanner if it exists
			await stopIfRunning();

			// Create new scanner instance if needed
			if (!scannerRef.current) {
				scannerRef.current = new Html5Qrcode(scannerId);
			}

			const config = {
				fps: SCANNER_CONFIG.FPS,
				qrbox: SCANNER_CONFIG.QRBOX_SIZE,
				aspectRatio: SCANNER_CONFIG.ASPECT_RATIO,
			};

			await scannerRef.current.start(
				{ facingMode: "environment" },
				config,
				onScanSuccess,
				onScanError ||
					((errorMessage) => {
						console.debug("QR scan error:", errorMessage);
					}),
			);

			toast.success(SUCCESS_MESSAGES.CAMERA_ACTIVATED, {
				description: SUCCESS_MESSAGES.CAMERA_READY,
			});

			return true;
		} catch (err: any) {
			console.error("Error starting scanner:", err);
			const errorMsg = err?.message || ERROR_MESSAGES.CAMERA_START_FAILED;

			toast.error(
				errorMsg.includes("Permission")
					? ERROR_MESSAGES.CAMERA_PERMISSION_DENIED
					: ERROR_MESSAGES.CAMERA_START_FAILED,
				{
					description: ERROR_MESSAGES.CAMERA_PERMISSION_HELP,
				},
			);

			return false;
		} finally {
			isTransitioningRef.current = false;
		}
	}, [scannerId, onScanSuccess, onScanError, isActive, stopIfRunning]);

	/**
	 * Stop the scanner
	 */
	const stopScanner = useCallback(async () => {
		// Prevent multiple rapid clicks
		if (isTransitioningRef.current || !isActive()) {
			console.log("Scanner already transitioning or not active");
			return false;
		}

		isTransitioningRef.current = true;

		try {
			await stopIfRunning();
			toast.info(SUCCESS_MESSAGES.CAMERA_STOPPED);
			return true;
		} catch (err) {
			console.error("Error stopping scanner:", err);
			return false;
		} finally {
			isTransitioningRef.current = false;
		}
	}, [isActive, stopIfRunning]);

	/**
	 * Cleanup on unmount
	 */
	useEffect(() => {
		return () => {
			if (scannerRef.current) {
				stopIfRunning().catch(console.error);
			}
		};
	}, [stopIfRunning]);

	return {
		startScanner,
		stopScanner,
		isActive,
		isTransitioning: isTransitioningRef.current,
	};
}
