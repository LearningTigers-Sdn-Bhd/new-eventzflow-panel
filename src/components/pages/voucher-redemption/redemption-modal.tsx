"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDialog } from "@/hooks/use-dialog";
import { redeemVoucher } from "@/lib/api/voucher-redemption";
import { AmountForm } from "./amount-form";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";
import { RedemptionResultCard } from "./redemption-result";
import { RedemptionScanner } from "./redemption-scanner";
import { ScannedInfoCard } from "./scanned-info-card";
import type { RedemptionResult, RedemptionState } from "./types";

interface VoucherRedemptionModalProps {
	onSuccess?: () => void;
}

export function VoucherRedemptionModal({
	onSuccess,
}: VoucherRedemptionModalProps) {
	const { closeDialog } = useDialog();
	const [isProcessing, setIsProcessing] = useState(false);
	const [redemptionState, setRedemptionState] = useState<RedemptionState>({
		voucherUuid: null,
		visitorId: null,
		grossAmount: null,
		currentStep: "voucher",
	});
	const [result, setResult] = useState<RedemptionResult | null>(null);

	// Track last scanned code to prevent duplicates
	const lastScannedRef = useRef<string | null>(null);
	const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Handle voucher QR scan success
	 */
	const handleVoucherScan = (decodedText: string) => {
		// Prevent duplicate scans of the same code
		if (lastScannedRef.current === decodedText) {
			return;
		}

		// Clear any existing timeout
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}

		// Mark this code as scanned
		lastScannedRef.current = decodedText;

		// Reset the last scanned after 2 seconds to allow rescanning if needed
		scanTimeoutRef.current = setTimeout(() => {
			lastScannedRef.current = null;
		}, 2000);

		// Save voucher UUID and move to visitor step
		setRedemptionState((prev) => ({
			...prev,
			voucherUuid: decodedText,
			currentStep: "visitor",
		}));

		toast.success(SUCCESS_MESSAGES.VOUCHER_SCANNED, {
			description: "Now scan the visitor's QR code",
		});
	};

	/**
	 * Handle visitor QR scan success
	 */
	const handleVisitorScan = (decodedText: string) => {
		// Prevent duplicate scans of the same code
		if (lastScannedRef.current === decodedText) {
			return;
		}

		// Clear any existing timeout
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}

		// Mark this code as scanned
		lastScannedRef.current = decodedText;

		// Reset the last scanned after 2 seconds to allow rescanning if needed
		scanTimeoutRef.current = setTimeout(() => {
			lastScannedRef.current = null;
		}, 2000);

		// Save visitor ID and move to amount step
		setRedemptionState((prev) => ({
			...prev,
			visitorId: decodedText,
			currentStep: "amount",
		}));

		toast.success(SUCCESS_MESSAGES.VISITOR_SCANNED, {
			description: "Now enter the transaction amount",
		});
	};

	/**
	 * Clear last scanned ref when step changes
	 */
	useEffect(() => {
		lastScannedRef.current = null;
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}
	}, [redemptionState.currentStep]);

	/**
	 * Handle amount submission and redemption
	 */
	const handleAmountSubmit = async (amount: number) => {
		if (!redemptionState.voucherUuid || !redemptionState.visitorId) {
			toast.error("Missing required information");
			return;
		}

		setIsProcessing(true);

		try {
			const response = await redeemVoucher({
				voucher_uuid: redemptionState.voucherUuid,
				gross_amount: amount,
				visitor_id: redemptionState.visitorId,
			});

			setResult({
				success: response.success,
				message: response.message,
				netAmount: response.netAmount,
				discountApplied: response.discountApplied,
				voucherType: response.voucherType,
				timestamp: new Date().toISOString(),
			});

			toast.success(SUCCESS_MESSAGES.REDEMPTION_SUCCESS);
			
			// Call onSuccess callback if provided
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : ERROR_MESSAGES.REDEMPTION_FAILED;

			setResult({
				success: false,
				message: errorMessage,
				timestamp: new Date().toISOString(),
			});

			toast.error("Redemption Failed", {
				description: errorMessage,
			});
		} finally {
			setIsProcessing(false);
		}
	};

	/**
	 * Reset to initial state
	 */
	const handleReset = () => {
		setRedemptionState({
			voucherUuid: null,
			visitorId: null,
			grossAmount: null,
			currentStep: "voucher",
		});
		setResult(null);
	};

	/**
	 * Clear voucher and restart
	 */
	const handleClearVoucher = () => {
		setRedemptionState({
			voucherUuid: null,
			visitorId: null,
			grossAmount: null,
			currentStep: "voucher",
		});
		lastScannedRef.current = null;
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}
	};

	/**
	 * Clear visitor and go back to visitor scan
	 */
	const handleClearVisitor = () => {
		setRedemptionState((prev) => ({
			...prev,
			visitorId: null,
			currentStep: "visitor",
		}));
		lastScannedRef.current = null;
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}
	};

	return (
		<div className="space-y-4">
			{/* Show result if redemption is complete */}
			{result ? (
				<RedemptionResultCard result={result} onReset={handleReset} />
			) : (
				<>
					{/* Scanned Info Card */}
					<ScannedInfoCard
						voucherUuid={redemptionState.voucherUuid}
						visitorId={redemptionState.visitorId}
						onClearVoucher={handleClearVoucher}
						onClearVisitor={handleClearVisitor}
					/>

					{/* Scanner or Amount Form */}
					{redemptionState.currentStep === "amount" ? (
						<AmountForm
							onSubmit={handleAmountSubmit}
							isProcessing={isProcessing}
						/>
					) : redemptionState.currentStep === "voucher" ? (
						<RedemptionScanner
							key="voucher-scanner"
							currentStep="voucher"
							onScanSuccess={handleVoucherScan}
							scannedData={{
								voucherUuid: redemptionState.voucherUuid,
								visitorId: redemptionState.visitorId,
							}}
						/>
					) : (
						<RedemptionScanner
							key="visitor-scanner"
							currentStep="visitor"
							onScanSuccess={handleVisitorScan}
							scannedData={{
								voucherUuid: redemptionState.voucherUuid,
								visitorId: redemptionState.visitorId,
							}}
						/>
					)}
				</>
			)}
		</div>
	);
}

