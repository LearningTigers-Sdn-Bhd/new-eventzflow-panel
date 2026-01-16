"use client";

import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface QRScannerProps {
	onScan: (value: string) => void;
}

const SCANNER_ID = "event-checkin-qr-reader";

export function QRScanner({ onScan }: QRScannerProps) {
	const [isActive, setIsActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const lastScannedRef = useRef<string>("");
	const lastScanTimeRef = useRef<number>(0);
	const isTransitioningRef = useRef(false);
	const mountedRef = useRef(true);

	const handleScanSuccess = useCallback(
		(decodedText: string) => {
			const now = Date.now();
			// Debounce: prevent same code within 3 seconds
			if (
				decodedText === lastScannedRef.current &&
				now - lastScanTimeRef.current < 3000
			) {
				return;
			}

			lastScannedRef.current = decodedText;
			lastScanTimeRef.current = now;
			onScan(decodedText);
		},
		[onScan],
	);

	const stopScanner = useCallback(async () => {
		if (!scannerRef.current || isTransitioningRef.current) return;

		try {
			const state = scannerRef.current.getState();
			if (
				state === Html5QrcodeScannerState.SCANNING ||
				state === Html5QrcodeScannerState.PAUSED
			) {
				isTransitioningRef.current = true;
				await scannerRef.current.stop();
			}
		} catch (err) {
			console.error("Error stopping scanner:", err);
		} finally {
			isTransitioningRef.current = false;
			if (mountedRef.current) {
				setIsActive(false);
			}
		}
	}, []);

	const startScanner = useCallback(async () => {
		if (isTransitioningRef.current) return;

		// Check if already scanning
		if (scannerRef.current) {
			const state = scannerRef.current.getState();
			if (state === Html5QrcodeScannerState.SCANNING) {
				setIsActive(true);
				return;
			}
		}

		setIsLoading(true);
		isTransitioningRef.current = true;

		try {
			if (!scannerRef.current) {
				scannerRef.current = new Html5Qrcode(SCANNER_ID);
			}

			await scannerRef.current.start(
				{ facingMode: "environment" },
				{
					fps: 10,
					qrbox: { width: 250, height: 250 },
					aspectRatio: 1.0,
				},
				handleScanSuccess,
				() => {}, // Ignore scan errors (continuous scanning)
			);

			if (mountedRef.current) {
				setIsActive(true);
			}
		} catch (err: unknown) {
			console.error("Error starting scanner:", err);
			const message =
				err instanceof Error ? err.message : "Failed to start camera";

			// Only show toast if it's not a transition error
			if (!message.includes("transition")) {
				toast.error(
					message.includes("Permission")
						? "Camera permission denied"
						: "Failed to start camera",
				);
			}
		} finally {
			isTransitioningRef.current = false;
			if (mountedRef.current) {
				setIsLoading(false);
			}
		}
	}, [handleScanSuccess]);

	// Cleanup on unmount
	useEffect(() => {
		mountedRef.current = true;

		return () => {
			mountedRef.current = false;
			if (scannerRef.current) {
				try {
					const state = scannerRef.current.getState();
					if (
						state === Html5QrcodeScannerState.SCANNING ||
						state === Html5QrcodeScannerState.PAUSED
					) {
						scannerRef.current.stop().catch(() => {});
					}
				} catch {
					// Ignore errors during cleanup
				}
				scannerRef.current = null;
			}
		};
	}, []);

	// Auto-start scanner when component mounts (run once)
	useEffect(() => {
		const timer = setTimeout(() => {
			startScanner();
		}, 100); // Small delay to ensure DOM is ready

		return () => clearTimeout(timer);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="space-y-6">
			{/* Scanner viewport */}
			<div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
				<div id={SCANNER_ID} className="h-full w-full" />

				{/* Overlay when inactive */}
				{!isActive && !isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
						<div className="text-center">
							<CameraOff className="mx-auto h-12 w-12 text-neutral-400" />
							<p className="mt-4 text-neutral-500 text-sm">Camera inactive</p>
						</div>
					</div>
				)}

				{/* Loading overlay */}
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
						<Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
					</div>
				)}

				{/* Scan frame overlay when active */}
				{isActive && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="h-64 w-64 border-2 border-white/50">
							{/* Corner accents */}
							<div className="absolute -top-0.5 -left-0.5 h-6 w-6 border-t-4 border-l-4 border-neutral-900" />
							<div className="absolute -top-0.5 -right-0.5 h-6 w-6 border-t-4 border-r-4 border-neutral-900" />
							<div className="absolute -bottom-0.5 -left-0.5 h-6 w-6 border-b-4 border-l-4 border-neutral-900" />
							<div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 border-b-4 border-r-4 border-neutral-900" />
						</div>
					</div>
				)}
			</div>

			{/* Control button */}
			<button
				type="button"
				onClick={isActive ? stopScanner : startScanner}
				disabled={isLoading}
				className="flex w-full items-center justify-center gap-3 border-2 border-neutral-200 bg-white px-6 py-4 font-medium text-neutral-600 uppercase tracking-wide transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
			>
				{isLoading ? (
					<Loader2 className="h-5 w-5 animate-spin" />
				) : isActive ? (
					<>
						<CameraOff className="h-5 w-5" />
						Stop Camera
					</>
				) : (
					<>
						<Camera className="h-5 w-5" />
						Start Camera
					</>
				)}
			</button>

			<p className="text-center text-neutral-400 text-sm">
				Point camera at QR code to scan
			</p>
		</div>
	);
}
