"use client";

import { Camera, CameraOff, QrCode, Scan } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { useDuplicateDetection } from "@/hooks/use-duplicate-detection";
import { useScanner } from "@/hooks/use-scanner";
import { useTicketValidation } from "@/hooks/use-ticket-validation";
import { cn } from "@/lib/utils";
import { SCANNER_CONFIG } from "../constants";
import { RecentScanCard } from "./recent-scan-card";
import type { ScanResult } from "../types";

interface ScannerCardProps {
	isScanning: boolean;
	onScanningChange: (isScanning: boolean) => void;
	onScanResult: (result: ScanResult) => void;
	scannedTicketIds: Set<string>;
	recentScans: ScanResult[];
}

export function ScannerCard({
	isScanning,
	onScanningChange,
	onScanResult,
	scannedTicketIds,
	recentScans,
}: ScannerCardProps) {
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Custom hooks for separation of concerns
	const { checkAndMark } = useDuplicateDetection();
	const { validateTicket, isProcessing } = useTicketValidation();

	/**
	 * Handle successful scan (both camera and physical scanner)
	 */
	const handleScanSuccess = async (decodedText: string) => {
		// Prevent processing multiple tickets simultaneously
		if (isProcessing) {
			return;
		}

		// Normalize input (trim whitespace)
		const normalizedText = decodedText.trim();

		// Check for rapid duplicate scan (debounce)
		if (checkAndMark(normalizedText)) {
			return;
		}

		// Validate ticket and handle result
		const result = await validateTicket(normalizedText, scannedTicketIds);
		onScanResult(result);
	};

	// Camera scanner hook
	const { startScanner: startScannerHook, stopScanner: stopScannerHook } =
		useScanner({
			scannerId: SCANNER_CONFIG.SCANNER_DIV_ID,
			onScanSuccess: handleScanSuccess,
		});

	// Physical hardware barcode scanner hook
	// This remains active as long as the component is mounted
	useBarcodeScanner({
		onScanSuccess: handleScanSuccess,
	});

	/**
	 * Start scanner with state management
	 */
	const handleStartScanner = async () => {
		setIsTransitioning(true);
		const success = await startScannerHook();
		if (success) {
			onScanningChange(true);
		}
		setIsTransitioning(false);
	};

	/**
	 * Stop scanner with state management
	 */
	const handleStopScanner = async () => {
		setIsTransitioning(true);
		const success = await stopScannerHook();
		if (success) {
			onScanningChange(false);
		}
		setIsTransitioning(false);
	};

	return (
		<Card className="overflow-hidden rounded-none border-primary/20 border-x-0 border-y border-dashed bg-accent p-2 shadow-none sm:p-4">
			<div
				className={cn(
					"grid gap-4 bg-white transition-all duration-500 sm:gap-6",
					isScanning
						? "grid-cols-1 lg:grid-cols-[1fr_auto_1fr]"
						: "grid-cols-1",
				)}
			>
				{/* Scanner Frame */}
				<div className="relative flex items-center justify-center">
					<div
						id={SCANNER_CONFIG.SCANNER_DIV_ID}
						className={cn(
							"aspect-square w-full rounded-none transition-all duration-500",
							isScanning
								? "max-w-sm sm:max-w-md"
								: "mx-auto max-w-sm sm:max-w-md",
						)}
						style={{
							position: "relative",
							overflow: "hidden",
						}}
					/>

					{/* Camera Off State */}
					{!isScanning && (
						<div className="absolute inset-0 flex flex-col items-center justify-center rounded-none border border-primary/30 border-dashed">
							<div className="max-w-sm space-y-4 px-3 text-center sm:space-y-6 sm:px-4">
								{/* Icon */}
								<div className="inline-flex rounded-none border border-primary/10 bg-primary/5 p-4 sm:p-6">
									<QrCode className="h-12 w-12 text-primary/60 sm:h-16 sm:w-16" />
								</div>

								{/* Text */}
								<div className="space-y-1 sm:space-y-2">
									<h3 className="font-semibold text-foreground text-lg sm:text-xl">
										Scanner Ready
									</h3>
									<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
										Activate your camera to scan OR simply scan with your
										physical hardware scanner anytime
									</p>
								</div>

								{/* Button */}
								<Button
									onClick={handleStartScanner}
									size="lg"
									className="w-full gap-2 rounded-none sm:w-auto"
									disabled={isTransitioning}
								>
									<Camera className="h-4 w-4" />
									Activate Camera
								</Button>
							</div>

							{/* Hardware Scanner Status */}
							<div className="absolute bottom-4 flex items-center gap-2 text-muted-foreground text-xs italic">
								<Scan className="h-3 w-3" />
								Hardware scanner active
							</div>
						</div>
					)}

					{/* Active Scanning Overlay */}
					{isScanning && (
						<>
							{/* Status Badge */}
							<div className="-translate-x-1/2 absolute top-2 left-1/2 z-20 sm:top-4">
								<div className="flex items-center gap-1.5 rounded-none bg-primary px-2 py-1 shadow-lg sm:gap-2 sm:px-3 sm:py-1.5">
									<span className="relative flex h-2 w-2">
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
										<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
									</span>
									<span className="font-medium text-[10px] text-primary-foreground sm:text-xs">
										Scanning Active
									</span>
								</div>
							</div>

							{/* Stop Button */}
							<div className="-translate-x-1/2 absolute bottom-2 left-1/2 z-20 w-full px-4 sm:bottom-4 sm:w-auto sm:px-0">
								<Button
									onClick={handleStopScanner}
									variant="destructive"
									size="default"
									className="w-full gap-2 rounded-none shadow-lg sm:w-auto"
									disabled={isTransitioning}
								>
									<CameraOff className="h-4 w-4" />
									Stop Scanner
								</Button>
							</div>
						</>
					)}
				</div>

				{/* Recent Scans Panel - Only visible when scanning */}
				{isScanning && (
					<>
						{/* Separator */}
						<div className="hidden items-center justify-center lg:flex">
							<div className="h-full w-px bg-border" />
						</div>

						<div className="hidden max-h-[448px] flex-col gap-3 overflow-hidden p-2 lg:flex">
							<div className="flex items-center justify-between pe-2">
								<h3 className="font-semibold text-muted-foreground text-sm">
									Recent Scans
								</h3>
								<span className="text-muted-foreground text-xs">
									{recentScans.length} total
								</span>
							</div>
							<div className="flex-1 space-y-2 overflow-y-auto pr-2">
								{recentScans.length === 0 ? (
									<div className="flex h-full items-center justify-center rounded-none border border-border border-dashed p-4 text-center">
										<p className="text-muted-foreground text-sm">
											Scanned tickets will appear here
										</p>
									</div>
								) : (
									recentScans.map((scan, idx) => (
										<RecentScanCard
											key={`${scan.scanId}-${idx}`}
											scan={scan}
										/>
									))
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</Card>
	);
}
