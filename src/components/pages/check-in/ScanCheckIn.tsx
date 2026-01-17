"use client";

import {
	ArrowLeft,
	Camera,
	CameraOff,
	CheckCircle2,
	LogIn,
	QrCode,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDuplicateDetection } from "@/hooks/use-duplicate-detection";
import { useScanner } from "@/hooks/use-scanner";
import { useTicketValidation } from "@/hooks/use-ticket-validation";
import { cn } from "@/lib/utils";
import type { ResultData } from "./types";

const SCANNER_CONFIG = {
	SCANNER_DIV_ID: "checkin-qr-reader",
	FPS: 10,
	QRBOX_SIZE: { width: 250, height: 250 },
	ASPECT_RATIO: 1.0,
	STOP_DELAY_MS: 100,
};

interface ScanCheckInProps {
	onBack: () => void;
	onResult: (result: ResultData) => void;
	station: string | null;
}

export function ScanCheckIn({ onBack, station }: ScanCheckInProps) {
	const router = useRouter();
	const { isAuthenticated, isInitialized } = useAuth();
	const [isScanning, setIsScanning] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [lastResult, setLastResult] = useState<ResultData | null>(null);
	const scannedTicketIdsRef = useRef<Set<string>>(new Set());
	const hasAutoStarted = useRef(false);

	const { checkAndMark } = useDuplicateDetection();
	const { validateTicket, isProcessing } = useTicketValidation();

	const handleScanSuccess = useCallback(
		async (decodedText: string) => {
			if (isProcessing) return;
			if (checkAndMark(decodedText)) return;

			const result = await validateTicket(
				decodedText,
				scannedTicketIdsRef.current,
			);

			const scanId = result.scanId;

			if (result.status === "success") {
				scannedTicketIdsRef.current.add(scanId.toLowerCase());

				const isVisitor = result.type === "visitor";
				const typeLabel = isVisitor ? "Visitor" : result.ticketType || "Ticket";

				const scanResult: ResultData = {
					success: true,
					message: "Check-in successful!",
					details: {
						name: result.name,
						ticketType: typeLabel,
						eventName: result.eventName,
					},
				};
				setLastResult(scanResult);
				toast.success("Check-in Successful", {
					description: `Welcome, ${result.name}!`,
				});
			} else if (result.status === "duplicate") {
				const scanResult: ResultData = {
					success: false,
					message: "Already checked in.",
					details: {
						name: result.name,
						ticketType: result.ticketType,
						eventName: result.eventName,
					},
				};
				setLastResult(scanResult);
				toast.error("Already Checked In", {
					description: "This was already used for check-in.",
				});
			} else {
				const scanResult: ResultData = {
					success: false,
					message: result.message || "Failed to validate.",
				};
				setLastResult(scanResult);
				toast.error("Scan Failed", {
					description: result.message || "Could not validate the QR code.",
				});
			}
		},
		[isProcessing, checkAndMark, validateTicket],
	);

	const { startScanner: startScannerHook, stopScanner: stopScannerHook } =
		useScanner({
			scannerId: SCANNER_CONFIG.SCANNER_DIV_ID,
			onScanSuccess: handleScanSuccess,
		});

	const handleStartScanner = useCallback(async () => {
		setIsTransitioning(true);
		const success = await startScannerHook();
		if (success) {
			setIsScanning(true);
		}
		setIsTransitioning(false);
	}, [startScannerHook]);

	const handleStopScanner = useCallback(async () => {
		setIsTransitioning(true);
		const success = await stopScannerHook();
		if (success) {
			setIsScanning(false);
		}
		setIsTransitioning(false);
	}, [stopScannerHook]);

	const handleBack = useCallback(async () => {
		// Stop scanner before going back
		if (isScanning) {
			await stopScannerHook();
		}
		onBack();
	}, [isScanning, stopScannerHook, onBack]);

	const handleLoginRedirect = () => {
		const returnUrl = station ? `/check-in?station=${station}` : "/check-in";
		router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
	};

	// Auto-start scanner when authenticated
	useEffect(() => {
		if (isInitialized && isAuthenticated && !hasAutoStarted.current) {
			hasAutoStarted.current = true;
			// Small delay to ensure DOM is ready
			const timer = setTimeout(() => {
				handleStartScanner();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isInitialized, isAuthenticated, handleStartScanner]);

	// Show loading state while hydrating
	if (!isInitialized) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
				<Button variant="outline" onClick={onBack} className="w-full gap-2">
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
			</div>
		);
	}

	// Show login prompt if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="space-y-4">
				<div className="rounded-lg border-2 border-amber-300 border-dashed bg-amber-50 p-6 text-center dark:border-amber-700 dark:bg-amber-950/30">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
						<LogIn className="h-8 w-8 text-amber-600 dark:text-amber-400" />
					</div>
					<h3 className="mb-2 font-semibold text-amber-800 text-lg dark:text-amber-200">
						Login Required
					</h3>
					<p className="mb-4 text-amber-700 text-sm dark:text-amber-300">
						You need to be logged in to use the QR scanner for check-in.
					</p>
					<Button onClick={handleLoginRedirect} className="w-full gap-2">
						<LogIn className="h-4 w-4" />
						Login to Continue
					</Button>
				</div>
				<Button variant="outline" onClick={onBack} className="w-full gap-2">
					<ArrowLeft className="h-4 w-4" />
					Back to Check-in Options
				</Button>
			</div>
		);
	}

	// Show scanner for authenticated users
	return (
		<div className="space-y-3">
			{/* Scanner */}
			<div className="relative">
				<div
					id={SCANNER_CONFIG.SCANNER_DIV_ID}
					className={cn(
						"aspect-square w-full rounded-lg transition-all duration-500",
						"mx-auto max-w-xs",
					)}
					style={{ position: "relative", overflow: "hidden" }}
				/>

				{/* Camera Off State */}
				{!isScanning && (
					<div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-primary/30 border-dashed bg-muted/50">
						<div className="max-w-xs space-y-4 px-4 text-center">
							<div className="inline-flex rounded-full border border-primary/20 bg-primary/10 p-4">
								<QrCode className="h-10 w-10 text-primary/70" />
							</div>
							<div className="space-y-1">
								<h3 className="font-semibold text-foreground">Ready to Scan</h3>
								<p className="text-muted-foreground text-xs">
									Activate the camera to scan ticket QR codes
								</p>
							</div>
							<Button
								onClick={handleStartScanner}
								className="w-full gap-2"
								disabled={isTransitioning}
							>
								<Camera className="h-4 w-4" />
								Start Scanner
							</Button>
						</div>
					</div>
				)}

				{/* Active Scanning Overlay */}
				{isScanning && (
					<>
						<div className="absolute top-2 left-1/2 z-20 -translate-x-1/2">
							<div className="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 shadow-lg">
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
								</span>
								<span className="font-medium text-primary-foreground text-xs">
									Scanning...
								</span>
							</div>
						</div>
						<div className="absolute bottom-2 left-1/2 z-20 w-full -translate-x-1/2 px-4">
							<Button
								onClick={handleStopScanner}
								variant="destructive"
								size="sm"
								className="w-full gap-2"
								disabled={isTransitioning}
							>
								<CameraOff className="h-4 w-4" />
								Stop
							</Button>
						</div>
					</>
				)}
			</div>

			{/* Last Scan Result */}
			{lastResult && (
				<div
					className={cn(
						"rounded-lg border-2 p-3",
						lastResult.success
							? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
							: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
					)}
				>
					<div className="flex items-start gap-3">
						{lastResult.success ? (
							<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
						) : (
							<XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
						)}
						<div className="min-w-0 flex-1">
							<p
								className={cn(
									"font-semibold text-sm",
									lastResult.success
										? "text-emerald-700 dark:text-emerald-300"
										: "text-red-700 dark:text-red-300",
								)}
							>
								{lastResult.message}
							</p>
							{lastResult.details && (
								<div
									className={cn(
										"mt-1 space-y-0.5 text-xs",
										lastResult.success
											? "text-emerald-600 dark:text-emerald-400"
											: "text-red-600 dark:text-red-400",
									)}
								>
									{lastResult.details.name && (
										<p>
											<span className="font-medium">Name:</span>{" "}
											{lastResult.details.name}
										</p>
									)}
									{lastResult.details.ticketType && (
										<p>
											<span className="font-medium">Ticket:</span>{" "}
											{lastResult.details.ticketType}
										</p>
									)}
									{lastResult.details.eventName && (
										<p>
											<span className="font-medium">Event:</span>{" "}
											{lastResult.details.eventName}
										</p>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<Button variant="outline" onClick={handleBack} className="w-full gap-2">
				<ArrowLeft className="h-4 w-4" />
				Back to Check-in Options
			</Button>
		</div>
	);
}
