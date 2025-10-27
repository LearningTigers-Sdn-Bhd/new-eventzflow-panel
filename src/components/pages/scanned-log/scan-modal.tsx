"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScanner } from "@/hooks/use-scanner";
import { useDuplicateDetection } from "@/hooks/use-duplicate-detection";
import { useTicketValidation } from "@/hooks/use-ticket-validation";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ScanModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
	onRefetch?: () => void;
}

export function ScanModal({ open, onOpenChange, eventId, onRefetch }: ScanModalProps) {
	const [isScanning, setIsScanning] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [scannedTicketIds] = useState<Set<string>>(new Set());

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

		// Validate ticket (backend will handle event association)
		const result = await validateTicket(decodedText, scannedTicketIds);

		// Show toast based on status
		if (result.status === "success") {
			toast.success("Ticket validated!", {
				description: `${result.attendeeName} - ${result.ticketType}`,
			});
			
			// Immediately refetch the scanned logs table after successful scan
			if (onRefetch) {
				onRefetch();
			}
		} else if (result.status === "duplicate") {
			toast.warning("Duplicate scan", {
				description: result.message,
			});
		} else {
			toast.error("Invalid ticket", {
				description: result.message,
			});
		}
	};

	// Scanner hook with dynamic scanner ID for modal
	const { startScanner: startScannerHook, stopScanner: stopScannerHook } =
		useScanner({
			scannerId: "modal-qr-reader",
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
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Quick Scan Ticket</DialogTitle>
					<DialogDescription>
						Scan tickets quickly within the current event context
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Scanner Section */}
					<Card className="overflow-hidden p-4">
						<div className="relative flex items-center justify-center">
							<div
								id="modal-qr-reader"
								className={cn(
									"w-full aspect-square rounded-lg transition-all duration-500 max-w-sm"
								)}
								style={{
									position: "relative",
									overflow: "hidden",
								}}
							/>

							{/* Camera Off State */}
							{!isScanning && (
								<div className="absolute inset-0 flex items-center justify-center border border-dashed border-primary/30 rounded-lg">
									<div className="text-center space-y-4 max-w-sm px-4">
										{/* Icon */}
										<div className="inline-flex p-6 rounded-2xl bg-primary/5 border border-primary/10">
											<QrCode className="h-16 w-16 text-primary/60" />
										</div>

										{/* Text */}
										<div className="space-y-2">
											<h3 className="text-xl font-semibold text-foreground">
												Ready to Scan
											</h3>
											<p className="text-sm text-muted-foreground leading-relaxed">
												Click the button below to activate your camera and start
												scanning tickets
											</p>
										</div>

										{/* Button */}
										<Button
											onClick={handleStartScanner}
											size="lg"
											className="gap-2 w-full"
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
									<div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
										<div className="bg-primary px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
											<span className="relative flex h-2 w-2">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
												<span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
											</span>
											<span className="text-primary-foreground font-medium text-xs">
												Scanning Active
											</span>
										</div>
									</div>

									{/* Stop Button */}
									<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full px-4">
										<Button
											onClick={handleStopScanner}
											variant="destructive"
											size="default"
											className="shadow-lg gap-2 w-full"
											disabled={isTransitioning}
										>
											<CameraOff className="h-4 w-4" />
											Stop Scanner
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
