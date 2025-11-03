"use client";

import { Camera, CameraOff, QrCode } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDuplicateDetection } from "@/hooks/use-duplicate-detection";
import { useScanner } from "@/hooks/use-scanner";
import { useTicketValidation } from "@/hooks/use-ticket-validation";
import { cn } from "@/lib/utils";
import { SCANNER_CONFIG } from "./constants";
import { RecentScanCard } from "./recent-scan-card";
import type { ScanResult } from "./types";

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
	const { startScanner: startScannerHook, stopScanner: stopScannerHook } =
		useScanner({
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
		<Card
			className={cn(
				"overflow-hidden rounded-none bg-accent p-0 shadow-none",
				isScanning ? "p-4" : "",
			)}
		>
			<div
				className={cn(
					"grid gap-4 transition-all duration-500 sm:gap-6",
					isScanning
						? "grid-cols-1 border border-primary/30 border-dashed lg:grid-cols-[1fr_auto_1fr]"
						: "grid-cols-1",
				)}
			>
				{/* Scanner Frame */}
				<div className="relative flex items-center justify-center">
					<div
						id={SCANNER_CONFIG.SCANNER_DIV_ID}
						className={cn(
							"m-0 aspect-square w-full rounded-none transition-all duration-500 md:m-2",
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
						<div className="absolute inset-0 flex h-full w-full flex-col">
							<div className="flex h-4 w-full flex-row border-b border-dashed">
								<div className="h-full w-4 border-r border-dashed" />
								<div className="h-full w-full" />
								<div className="h-full w-4 border-l border-dashed" />
							</div>
							<div className="flex h-full w-full flex-row border-b border-dashed">
								<div className="h-full w-4 border-r border-dashed" />
								{/* Content Here */}
								<div className="flex h-full w-full items-center justify-center">
									<div className="flex h-full w-full max-w-sm flex-col items-center justify-center space-y-4 px-3 text-center md:space-y-6 md:px-4">
										{/* Icon */}
										<div className="inline-flex rounded-none border border-primary/10 border-dashed bg-primary/5 p-4 md:p-6">
											<QrCode className="h-10 w-10 text-primary/60 md:h-14 md:w-14" />
										</div>

										{/* Text */}
										<div className="space-y-1 md:space-y-2">
											<h3 className="font-bold text-base text-foreground md:text-xl">
												Ready to Scan
											</h3>
											<p className="text-balance text-muted-foreground text-sm leading-relaxed md:text-sm">
												Click the button below to activate your camera and start
												scanning tickets
											</p>
										</div>

										{/* Button */}
										<Button
											onClick={handleStartScanner}
											size="lg"
											className="w-full gap-2 rounded-none md:w-auto"
											disabled={isTransitioning}
										>
											<Camera className="size-3 md:size-4" />
											<span className="text-sm md:text-base">
												Activate Scanner
											</span>
										</Button>
									</div>
								</div>
								<div className="h-full w-4 border-l border-dashed" />
							</div>
							<div className="flex h-4 w-full flex-row border-b border-dashed">
								<div className="h-full w-4 border-r border-dashed" />
								<div className="h-full w-full" />
								<div className="h-full w-4 border-l border-dashed" />
							</div>
						</div>
					)}

					{/* Active Scanning Overlay */}
					{isScanning && (
						<>
							{/* Status Badge */}
							<div className="-translate-x-1/2 absolute top-2 left-1/2 z-20 sm:top-4">
								<div className="flex items-center gap-1.5 rounded-full bg-primary px-2 py-1 shadow-lg sm:gap-2 sm:px-3 sm:py-1.5">
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
							<div className="-translate-x-1/2 absolute bottom-2 left-1/2 z-20 w-full px-4 md:bottom-6 md:w-auto md:px-0">
								<Button
									onClick={handleStopScanner}
									variant="destructive"
									size="default"
									className="w-full gap-2 rounded-none shadow-lg sm:w-auto"
									disabled={isTransitioning}
								>
									<CameraOff className="size-3 md:size-4" />
									<span className="text-sm sm:text-base">Stop Scanner</span>
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

						<div className="hidden max-h-[448px] flex-col gap-3 overflow-hidden lg:flex">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-muted-foreground text-sm">
									Recent Scans
								</h3>
								<span className="text-muted-foreground text-xs">
									{recentScans.length} total
								</span>
							</div>
							<div className="flex-1 space-y-2 overflow-y-auto pr-2">
								{recentScans.length === 0 ? (
									<div className="flex h-full items-center justify-center rounded-lg border border-border border-dashed p-4 text-center">
										<p className="text-muted-foreground text-sm">
											Scanned tickets will appear here
										</p>
									</div>
								) : (
									recentScans.map((scan, idx) => (
										<RecentScanCard
											key={`${scan.ticketId}-${idx}`}
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
