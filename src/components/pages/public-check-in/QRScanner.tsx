"use client";

import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QRScannerProps {
	onScan: (value: string) => void;
	facingMode?: "user" | "environment";
}

const SCANNER_ID = "event-checkin-qr-reader";

export function QRScanner({
	onScan,
	facingMode = "environment",
}: QRScannerProps) {
	const [isLoading, setIsLoading] = useState(false);
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const lastScannedRef = useRef<string>("");
	const lastScanTimeRef = useRef<number>(0);
	const isTransitioningRef = useRef(false);
	const mountedRef = useRef(true);

	const handleScanSuccess = useCallback(
		(decodedText: string) => {
			console.log("🔍 QR Scanner Success:", decodedText);
			const now = Date.now();
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

	const startScanner = useCallback(async () => {
		console.log("🚀 Starting QR Scanner with facingMode:", facingMode);
		if (isTransitioningRef.current) return;
		if (scannerRef.current) {
			const state = scannerRef.current.getState();
			if (state === Html5QrcodeScannerState.SCANNING) return;
		}

		setIsLoading(true);
		isTransitioningRef.current = true;

		try {
			if (!scannerRef.current) {
				scannerRef.current = new Html5Qrcode(SCANNER_ID);
			}

			await scannerRef.current.start(
				{ facingMode: facingMode },
				{
					fps: 10,
					qrbox: (viewfinderWidth, viewfinderHeight) => {
						const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
						const size = Math.floor(minEdge * 0.6);
						return { width: size, height: size };
					},
					aspectRatio: 1.0,
				},
				handleScanSuccess,
				(errorMessage) => {
					// Silent error for no QR code found in frame
				},
			);
			console.log("✅ QR Scanner started successfully");
		} catch (err: unknown) {
			console.error("❌ Error starting scanner:", err);
			const message =
				err instanceof Error ? err.message : "Failed to start camera";
			if (!message.includes("transition")) {
				toast.error(`Camera error: ${message}`);
			}
		} finally {
			isTransitioningRef.current = false;
			if (mountedRef.current) setIsLoading(false);
		}
	}, [handleScanSuccess, facingMode]);

	useEffect(() => {
		mountedRef.current = true;
		const timer = setTimeout(() => startScanner(), 100);

		return () => {
			mountedRef.current = false;
			clearTimeout(timer);
			if (scannerRef.current) {
				try {
					const state = scannerRef.current.getState();
					if (
						state === Html5QrcodeScannerState.SCANNING ||
						state === Html5QrcodeScannerState.PAUSED
					) {
						scannerRef.current.stop().catch(() => {});
					}
				} catch {}
				scannerRef.current = null;
			}
		};
	}, [startScanner]);

	return (
		<div className="group relative h-full w-full">
			<div
				id={SCANNER_ID}
				className={cn(
					"h-full w-full bg-neutral-950",
					facingMode === "user" && "[&_video]:scale-x-[-1]",
				)}
			/>

			{/* Loading State */}
			{isLoading && (
				<div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950">
					<Loader2 className="h-8 w-8 animate-spin text-brand-green" />
				</div>
			)}

			{/* UI Overlay */}
			<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
				<div className="relative h-64 w-64">
					{/* Corners */}
					<div className="absolute top-0 left-0 h-8 w-8 border-brand-green border-t-2 border-l-2" />
					<div className="absolute top-0 right-0 h-8 w-8 border-brand-green border-t-2 border-r-2" />
					<div className="absolute bottom-0 left-0 h-8 w-8 border-brand-green border-b-2 border-l-2" />
					<div className="absolute right-0 bottom-0 h-8 w-8 border-brand-green border-r-2 border-b-2" />

					{/* Laser Scan Effect */}
					<div className="absolute inset-x-0 h-0.5 animate-[scan_2s_ease-in-out_infinite] bg-brand-green/80 shadow-[0_0_15px_rgba(35,196,96,0.8)]" />

					{/* Label */}
					<div className="absolute right-0 -bottom-8 left-0 text-center">
						<span className="border border-brand-green/20 bg-brand-green/10 px-3 py-1 font-mono text-[10px] text-brand-green uppercase tracking-widest backdrop-blur-md">
							Scanning Active
						</span>
					</div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes scan {
					0% { top: 0%; opacity: 0; }
					10% { opacity: 1; }
					90% { opacity: 1; }
					100% { top: 100%; opacity: 0; }
				}
			`}</style>
		</div>
	);
}
