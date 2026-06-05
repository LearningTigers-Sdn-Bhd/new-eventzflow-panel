/**
 * Barcode Scanner Hook
 * Listens for keyboard events from physical barcode scanners (keyboard emulators)
 */

import { useEffect, useRef } from "react";

interface UseBarcodeScannerOptions {
	onScanSuccess: (decodedText: string) => void;
	enabled?: boolean;
}

/**
 * Hook to handle input from physical barcode scanners that act as keyboard emulators.
 * Most hardware scanners send characters rapidly followed by an "Enter" key.
 */
export function useBarcodeScanner({
	onScanSuccess,
	enabled = true,
}: UseBarcodeScannerOptions) {
	const bufferRef = useRef<string>("");
	const lastKeyTimeRef = useRef<number>(0);

	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			// Ignore if user is typing in an input, textarea or contentEditable element
			const target = event.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			const currentTime = Date.now();

			// Scanners are extremely fast (usually < 50ms between keys).
			// If it's been too long (e.g., > 100ms), we treat it as manual typing or a fresh start.
			if (currentTime - lastKeyTimeRef.current > 100) {
				bufferRef.current = "";
			}

			lastKeyTimeRef.current = currentTime;

			// Most scanners send "Enter" as a suffix
			if (event.key === "Enter") {
				if (bufferRef.current.length > 0) {
					const scannedData = bufferRef.current;
					bufferRef.current = "";
					onScanSuccess(scannedData);
				}
				return;
			}

			// Capture printable characters
			// event.key.length === 1 ensures we ignore Shift, Alt, Ctrl, etc.
			if (event.key.length === 1) {
				bufferRef.current += event.key;
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [enabled, onScanSuccess]);

	return {
		clearBuffer: () => {
			bufferRef.current = "";
		},
	};
}
