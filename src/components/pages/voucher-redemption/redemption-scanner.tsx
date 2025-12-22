"use client";

import { Camera, CameraOff, CheckCircle2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScanner } from "@/hooks/use-scanner";
import { cn } from "@/lib/utils";
import { SCANNER_CONFIG, STEP_LABELS } from "./constants";
import type { ScanStep } from "./types";

interface RedemptionScannerProps {
	currentStep: ScanStep;
	onScanSuccess: (decodedText: string) => void;
	scannedData: {
		voucherUuid: string | null;
		visitorId: string | null;
	};
}

export function RedemptionScanner({
	currentStep,
	onScanSuccess,
	scannedData,
}: RedemptionScannerProps) {
	const [isScanning, setIsScanning] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Use unique scanner ID for each step to ensure proper cleanup
	const scannerId = `${SCANNER_CONFIG.SCANNER_DIV_ID}-${currentStep}`;

	const { startScanner: startScannerHook, stopScanner: stopScannerHook } =
		useScanner({
			scannerId,
			onScanSuccess,
		});

	// Auto-open scanner for visitor step (camera permission already granted from voucher step)
	useEffect(() => {
		if (currentStep === "visitor" && !isScanning && !isTransitioning) {
			// Small delay to ensure DOM is ready
			const timer = setTimeout(() => {
				handleStartScanner();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [currentStep]);

	const handleStartScanner = async () => {
		setIsTransitioning(true);
		const success = await startScannerHook();
		if (success) {
			setIsScanning(true);
		}
		setIsTransitioning(false);
	};

	const handleStopScanner = async () => {
		setIsTransitioning(true);
		const success = await stopScannerHook();
		if (success) {
			setIsScanning(false);
		}
		setIsTransitioning(false);
	};

	const getStepIcon = (step: ScanStep) => {
		if (step === "voucher" && scannedData.voucherUuid) {
			return <CheckCircle2 className="h-5 w-5 text-green-500" />;
		}
		if (step === "visitor" && scannedData.visitorId) {
			return <CheckCircle2 className="h-5 w-5 text-green-500" />;
		}
		return null;
	};

	return (
		<Card className="overflow-hidden rounded-lg border-primary/20 bg-accent p-4 shadow-sm">
			{/* Progress Steps */}
			<div className="mb-4 flex items-center justify-center gap-2">
				{(["voucher", "visitor", "review"] as ScanStep[]).map((step, idx) => (
					<div key={step} className="flex items-center gap-2">
						<div
							className={cn(
								"flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
								currentStep === step
									? "bg-primary text-primary-foreground"
									: step === "voucher" && scannedData.voucherUuid
										? "bg-green-600 text-white"
										: step === "visitor" && scannedData.visitorId
											? "bg-green-600 text-white"
											: "bg-muted text-muted-foreground",
							)}
						>
							{getStepIcon(step) || (
								<span
									className={cn(
										"font-semibold",
										(step === "voucher" && scannedData.voucherUuid) ||
											(step === "visitor" && scannedData.visitorId)
											? "text-white"
											: "",
									)}
								>
									{idx + 1}
								</span>
							)}
							<span className="hidden sm:inline">{STEP_LABELS[step]}</span>
						</div>
						{idx < 2 && <div className="h-px w-4 bg-border sm:w-8" />}
					</div>
				))}
			</div>

			{/* Scanner Frame */}
			<div className="relative flex items-center justify-center bg-white">
				<div
					id={scannerId}
					className="aspect-square w-full max-w-md rounded-lg"
					style={{
						position: "relative",
						overflow: "hidden",
					}}
				/>

				{/* Camera Off State */}
				{!isScanning && (
					<div className="absolute inset-0 flex items-center justify-center rounded-lg border border-primary/30 border-dashed">
						<div className="max-w-sm space-y-4 px-4 text-center">
							<div className="inline-flex rounded-lg border border-primary/10 bg-primary/5 p-6">
								<QrCode className="h-16 w-16 text-primary/60" />
							</div>

							<div className="space-y-2">
								<h3 className="font-semibold text-foreground text-xl">
									{STEP_LABELS[currentStep]}
								</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{currentStep === "voucher"
										? "Scan the voucher QR code to begin"
										: "Scan the visitor's QR code to continue"}
								</p>
							</div>

							<Button
								onClick={handleStartScanner}
								size="lg"
								className="w-full gap-2 sm:w-auto"
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
						<div className="-translate-x-1/2 absolute top-4 left-1/2 z-20">
							<div className="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 shadow-lg">
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
								</span>
								<span className="font-medium text-primary-foreground text-xs">
									{currentStep === "voucher"
										? "Scan Voucher QR"
										: "Scan Visitor QR"}
								</span>
							</div>
						</div>

						<div className="-translate-x-1/2 absolute bottom-4 left-1/2 z-20 w-full px-4 sm:w-auto sm:px-0">
							<Button
								onClick={handleStopScanner}
								variant="destructive"
								size="default"
								className="w-full gap-2 shadow-lg sm:w-auto"
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
	);
}
