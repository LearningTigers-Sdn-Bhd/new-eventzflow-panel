"use client";

import { Camera, CameraOff, QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";
import { useScanner } from "@/hooks/use-scanner";
import { useCreateStamp } from "@/hooks/use-visitor-stamps";
import { cn } from "@/lib/utils";

interface ScanModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
	onRefetch?: () => void;
}

const SCANNER_CONFIG = {
	SCANNER_DIV_ID: "visitor-stamp-modal-scanner",
	QR_BOX_SIZE: 250,
	FPS: 10,
};

// Track recent scans to prevent duplicates within 5 seconds
const DUPLICATE_SCAN_COOLDOWN = 5000; // 5 seconds

export function ScanModal({
	open,
	onOpenChange,
	eventId,
	onRefetch,
}: ScanModalProps) {
	const [isScanning, setIsScanning] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const recentScansRef = useRef<Map<string, number>>(new Map());
	const createStamp = useCreateStamp();

	// Get the current user's event vendor ID for this event
	const {
		eventVendorId,
		isLoading: isLoadingVendorId,
		isVendor,
	} = useCurrentUserEventVendorId(Number(eventId));

	/**
	 * Handle successful QR code scan
	 */
	const handleScanSuccess = async (decodedText: string) => {
		// Prevent processing if already creating a stamp
		if (createStamp.isPending) {
			return;
		}

		// Check for rapid duplicate scan
		const now = Date.now();
		const lastScanTime = recentScansRef.current.get(decodedText);

		if (lastScanTime && now - lastScanTime < DUPLICATE_SCAN_COOLDOWN) {
			return; // Silently ignore duplicate within cooldown
		}

		// Mark this scan
		recentScansRef.current.set(decodedText, now);

		// Clean up old scans
		for (const [key, timestamp] of recentScansRef.current.entries()) {
			if (now - timestamp > DUPLICATE_SCAN_COOLDOWN) {
				recentScansRef.current.delete(key);
			}
		}

		try {
			if (!eventVendorId) {
				toast.error("You are not assigned as a vendor for this event.", {
					description:
						"Please contact the event administrator to get vendor access.",
				});
				return;
			}

			await createStamp.mutateAsync({
				publicId: decodedText,
				data: { event_vendor_id: eventVendorId },
			});

			toast.success("Stamp created successfully!");

			// Play success sound
			playBeep(800, 100);

			// Refetch data
			if (onRefetch) {
				onRefetch();
			}
		} catch (error: any) {
			const errorMsg = error?.message || "Failed to create stamp";

			// Handle backend duplicate error
			if (errorMsg.includes("duplicate") || errorMsg.includes("already")) {
				toast.error("This visitor has already been stamped by you.");
			} else {
				toast.error(errorMsg);
			}

			// Play error sound
			playBeep(400, 200);
		}
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
			setIsScanning(true);
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
			setIsScanning(false);
		}
		setIsTransitioning(false);
	};

	/**
	 * Play beep sound for feedback
	 */
	const playBeep = (frequency: number, duration: number) => {
		try {
			const audioContext = new (
				window.AudioContext || (window as any).webkitAudioContext
			)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.value = frequency;
			oscillator.type = "sine";

			gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(
				0.01,
				audioContext.currentTime + duration / 1000,
			);

			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + duration / 1000);
		} catch (error) {
			// Silently fail if audio is not supported
		}
	};

	/**
	 * Auto-start scanner when modal opens
	 */
	useEffect(() => {
		if (open && !isScanning) {
			// Small delay to ensure modal is fully rendered
			const timer = setTimeout(() => {
				handleStartScanner();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	/**
	 * Stop scanner when modal closes
	 */
	useEffect(() => {
		if (!open && isScanning) {
			handleStopScanner();
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Scan Visitor QR Code</DialogTitle>
					<DialogDescription>
						Point your camera at a visitor's QR code to create a stamp
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Scanner Section */}
					<Card className="overflow-hidden p-4">
						<div className="relative flex items-center justify-center">
							<div
								id={SCANNER_CONFIG.SCANNER_DIV_ID}
								className={cn(
									"aspect-square w-full max-w-sm rounded-lg transition-all duration-500",
								)}
								style={{
									position: "relative",
									overflow: "hidden",
								}}
							/>

							{/* Loading Vendor Status */}
							{isLoadingVendorId && !isScanning && (
								<div className="absolute inset-0 flex items-center justify-center rounded-lg border border-primary/30 border-dashed">
									<div className="max-w-sm space-y-4 px-4 text-center">
										<div className="inline-flex rounded-2xl border border-primary/10 bg-primary/5 p-6">
											<QrCode className="h-16 w-16 animate-pulse text-primary/60" />
										</div>
										<div className="space-y-2">
											<h3 className="font-semibold text-foreground text-xl">
												Checking Permissions...
											</h3>
											<p className="text-muted-foreground text-sm leading-relaxed">
												Verifying your vendor access for this event
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Not a Vendor Warning */}
							{!isLoadingVendorId && !isVendor && !isScanning && (
								<div className="absolute inset-0 flex items-center justify-center rounded-lg border border-destructive/30 border-dashed bg-destructive/5">
									<div className="max-w-sm space-y-4 px-4 text-center">
										<div className="inline-flex rounded-2xl border border-destructive/10 bg-destructive/5 p-6">
											<QrCode className="h-16 w-16 text-destructive/60" />
										</div>
										<div className="space-y-2">
											<h3 className="font-semibold text-foreground text-xl">
												Access Denied
											</h3>
											<p className="text-muted-foreground text-sm leading-relaxed">
												You are not assigned as a vendor for this event. Please
												contact the event administrator.
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Camera Off State */}
							{!isLoadingVendorId && isVendor && !isScanning && (
								<div className="absolute inset-0 flex items-center justify-center rounded-lg border border-primary/30 border-dashed">
									<div className="max-w-sm space-y-4 px-4 text-center">
										{/* Icon */}
										<div className="inline-flex rounded-2xl border border-primary/10 bg-primary/5 p-6">
											<QrCode className="h-16 w-16 text-primary/60" />
										</div>

										{/* Text */}
										<div className="space-y-2">
											<h3 className="font-semibold text-foreground text-xl">
												Ready to Scan
											</h3>
											<p className="text-muted-foreground text-sm leading-relaxed">
												Click the button below to activate your camera and start
												scanning visitor QR codes
											</p>
										</div>

										{/* Button */}
										<Button
											onClick={handleStartScanner}
											size="lg"
											className="w-full gap-2"
											disabled={isTransitioning || !isVendor}
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
									<div className="-translate-x-1/2 absolute top-4 left-1/2 z-20">
										<div className="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 shadow-lg">
											<span className="relative flex h-2 w-2">
												<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
												<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
											</span>
											<span className="font-medium text-primary-foreground text-xs">
												Scanning Active
											</span>
										</div>
									</div>

									{/* Stop Button */}
									<div className="-translate-x-1/2 absolute bottom-4 left-1/2 z-20 w-full px-4">
										<Button
											onClick={handleStopScanner}
											variant="destructive"
											size="default"
											className="w-full gap-2 shadow-lg"
											disabled={isTransitioning}
										>
											<CameraOff className="h-4 w-4" />
											Stop Camera
										</Button>
									</div>
								</>
							)}
						</div>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	);
}
