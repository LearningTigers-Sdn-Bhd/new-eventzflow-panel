"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CameraOff, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanResult } from "./types";
import { useScanner } from "@/hooks/use-scanner";
import { useDuplicateDetection } from "@/hooks/use-duplicate-detection";
import { useTicketValidation } from "@/hooks/use-ticket-validation";
import { RecentScanCard } from "./recent-scan-card";
import { SCANNER_CONFIG } from "./constants";

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
	 * Handle successful QR code scan
	 */
	const handleScanSuccess = async (decodedText: string) => {
		// Prevent processing multiple tickets simultaneously
		if (isProcessing) {
			return;
		}

		// Check for rapid duplicate scan (debounce)
		if (checkAndMark(decodedText)) {
			return;
		}

		// Validate ticket and handle result
		const result = await validateTicket(decodedText, scannedTicketIds);
		onScanResult(result);
	};

	// Scanner hook
	const { startScanner: startScannerHook, stopScanner: stopScannerHook } = useScanner({
		scannerId: SCANNER_CONFIG.SCANNER_DIV_ID,
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
		<Card className="overflow-hidden p-3 sm:p-4 md:p-6">
			<div
				className={cn(
					"grid gap-4 sm:gap-6 transition-all duration-500",
					isScanning ? "grid-cols-1 lg:grid-cols-[1fr_auto_1fr]" : "grid-cols-1"
				)}
			>
				{/* Scanner Frame */}
				<div className="relative flex items-center justify-center">
					<div
						id={SCANNER_CONFIG.SCANNER_DIV_ID}
						className={cn(
							"w-full aspect-square rounded-lg transition-all duration-500",
							isScanning ? "max-w-sm sm:max-w-md" : "max-w-sm sm:max-w-md mx-auto"
						)}
						style={{
							position: "relative",
							overflow: "hidden",
						}}
					/>

					{/* Camera Off State */}
					{!isScanning && (
						<div className="absolute inset-0 flex items-center justify-center border border-dashed border-primary/30 rounded-lg">
							<div className="text-center space-y-4 sm:space-y-6 max-w-sm px-3 sm:px-4">
								{/* Icon */}
								<div className="inline-flex p-4 sm:p-6 rounded-2xl bg-primary/5 border border-primary/10">
									<QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-primary/60" />
								</div>

								{/* Text */}
								<div className="space-y-1 sm:space-y-2">
									<h3 className="text-lg sm:text-xl font-semibold text-foreground">
										Ready to Scan
									</h3>
									<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
										Click the button below to activate your camera and start scanning tickets
									</p>
								</div>

								{/* Button */}
								<Button
									onClick={handleStartScanner}
									size="lg"
									className="gap-2 w-full sm:w-auto"
									disabled={isTransitioning}
								>
									<Camera className="h-4 w-4" />
									Activate Scanner
								</Button>
							</div>
						</div>
					)}

					{/* Active Scanning Overlay */}
					{isScanning && (
						<>
							{/* Status Badge */}
							<div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-20">
								<div className="bg-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2">
									<span className="relative flex h-2 w-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
										<span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
									</span>
									<span className="text-primary-foreground font-medium text-[10px] sm:text-xs">
										Scanning Active
									</span>
								</div>
							</div>

							{/* Stop Button */}
							<div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 w-full px-4 sm:w-auto sm:px-0">
								<Button
									onClick={handleStopScanner}
									variant="destructive"
									size="default"
									className="shadow-lg gap-2 w-full sm:w-auto"
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
						<div className="hidden lg:flex items-center justify-center">
							<div className="h-full w-px bg-border" />
						</div>

						<div className="hidden lg:flex flex-col gap-3 max-h-[448px] overflow-hidden">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-semibold text-muted-foreground">Recent Scans</h3>
								<span className="text-xs text-muted-foreground">{recentScans.length} total</span>
							</div>
							<div className="flex-1 overflow-y-auto space-y-2 pr-2">
								{recentScans.length === 0 ? (
									<div className="flex items-center justify-center h-full text-center p-4 border border-dashed border-border rounded-lg">
										<p className="text-sm text-muted-foreground">
											Scanned tickets will appear here
										</p>
									</div>
								) : (
									recentScans.map((scan, idx) => (
										<RecentScanCard key={`${scan.ticketId}-${idx}`} scan={scan} />
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
