"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDialog } from "@/hooks/use-dialog";
import { getVisitorByPublicId } from "@/lib/api/visitor";
import { getVoucherByUuid } from "@/lib/api/voucher";
import { redeemVoucher } from "@/lib/api/voucher-redemption";
import { restClient } from "@/utils/rest-api";
import { AmountForm } from "./amount-form";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";
import { RedemptionResultCard } from "./redemption-result";
import { RedemptionReviewCard } from "./redemption-review-card";
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
	const params = useParams();
	const eventId = params?.event_id ? Number(params.event_id) : undefined;
	const [isProcessing, setIsProcessing] = useState(false);
	const [redemptionState, setRedemptionState] = useState<RedemptionState>({
		voucherUuid: null,
		visitorId: null,
		grossAmount: null,
		currentStep: "voucher",
		voucherDetails: null,
		visitorDetails: null,
		isLoadingVoucher: false,
		isLoadingVisitor: false,
	});
	const [result, setResult] = useState<RedemptionResult | null>(null);

	// Track last scanned code to prevent duplicates
	const lastScannedRef = useRef<string | null>(null);
	const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Handle voucher QR scan success
	 */
	const handleVoucherScan = async (decodedText: string) => {
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

		// Fetch voucher details by UUID
		setRedemptionState((prev) => ({
			...prev,
			voucherUuid: decodedText,
			isLoadingVoucher: true,
		}));

		try {
			const voucherData = await getVoucherByUuid(decodedText);

			setRedemptionState((prev) => ({
				...prev,
				voucherDetails: {
					id: voucherData.id,
					title: voucherData.title,
					voucherType: voucherData.voucherType,
					voucherValue: voucherData.voucherValue,
					description: voucherData.description,
					totalRedemptionAvailable: voucherData.totalRedemptionAvailable ?? 0,
					redeemedCount: voucherData.redeemedCount,
					status: voucherData.status,
				},
				isLoadingVoucher: false,
				currentStep: "visitor",
			}));

			toast.success(SUCCESS_MESSAGES.VOUCHER_SCANNED, {
				description: "Now scan the attendee's QR code",
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to fetch voucher details";

			setRedemptionState((prev) => ({
				...prev,
				isLoadingVoucher: false,
			}));

			toast.error("Invalid Voucher", {
				description: errorMessage,
			});

			// Reset to allow rescan
			lastScannedRef.current = null;
		}
	};

	/**
	 * Handle visitor/ticket QR scan success
	 * Tries visitor lookup first, then ticket if visitor not found
	 */
	const handleVisitorScan = async (decodedText: string) => {
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

		if (!eventId) {
			toast.error("No event selected");
			return;
		}

		// Fetch visitor/ticket details by public_id
		setRedemptionState((prev) => ({
			...prev,
			visitorId: decodedText,
			isLoadingVisitor: true,
		}));

		try {
			// Try visitor lookup first
			const visitorData = await getVisitorByPublicId(eventId, decodedText);

			setRedemptionState((prev) => ({
				...prev,
				visitorDetails: {
					id: visitorData.id,
					publicId: visitorData.public_id,
					fullName: visitorData.full_name,
					email: visitorData.email,
					phone: visitorData.phone,
					eventId: visitorData.event_id,
					redeemerType: "visitor",
				},
				isLoadingVisitor: false,
				currentStep: "review",
			}));

			toast.success(SUCCESS_MESSAGES.VISITOR_SCANNED, {
				description: "Review the details below",
			});
		} catch {
			// Visitor not found, try ticket lookup
			try {
				const ticketData = await restClient.get<{
					id: number;
					public_id: string;
					attendee_name: string;
					attendee_email: string;
					attendee_phone: string | null;
					event_id: number;
				}>(`v1/events/${eventId}/tickets/${decodedText}`);

				setRedemptionState((prev) => ({
					...prev,
					visitorDetails: {
						id: ticketData.id,
						publicId: ticketData.public_id,
						fullName: ticketData.attendee_name,
						email: ticketData.attendee_email,
						phone: ticketData.attendee_phone || "",
						eventId: ticketData.event_id,
						redeemerType: "ticket",
					},
					isLoadingVisitor: false,
					currentStep: "review",
				}));

				toast.success("Ticket Scanned", {
					description: "Review the details below",
				});
			} catch (ticketError) {
				const errorMessage =
					ticketError instanceof Error
						? ticketError.message
						: "No visitor or ticket found with this QR code";

				setRedemptionState((prev) => ({
					...prev,
					isLoadingVisitor: false,
				}));

				toast.error("Invalid QR Code", {
					description: errorMessage,
				});

				// Reset to allow rescan
				lastScannedRef.current = null;
			}
		}
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
	 * @param finalPrice - The final amount (what the customer pays after discount)
	 */
	const handleAmountSubmit = async (finalPrice: number) => {
		if (!redemptionState.voucherUuid || !redemptionState.visitorId) {
			toast.error("Missing required information");
			return;
		}

		setIsProcessing(true);

		try {
			const isTicket = redemptionState.visitorDetails?.redeemerType === "ticket";

			// Pass the final price as net_amount
			// The backend will calculate the original price (gross_amount)
			const response = await redeemVoucher({
				voucher_uuid: redemptionState.voucherUuid,
				net_amount: finalPrice,
				...(isTicket
					? { ticket_id: redemptionState.visitorId }
					: { visitor_id: redemptionState.visitorId }),
			});

			setResult({
				success: response.success,
				message: response.message,
				netAmount: response.netAmount,
				discountApplied: response.discountApplied,
				voucherType:
					redemptionState.voucherDetails?.voucherType || response.voucherType,
				timestamp: new Date().toISOString(),
			});

			toast.success(SUCCESS_MESSAGES.REDEMPTION_SUCCESS);

			// Call onSuccess callback if provided
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: ERROR_MESSAGES.REDEMPTION_FAILED;

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
			voucherDetails: null,
			visitorDetails: null,
			isLoadingVoucher: false,
			isLoadingVisitor: false,
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
			voucherDetails: null,
			visitorDetails: null,
			isLoadingVoucher: false,
			isLoadingVisitor: false,
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
			visitorDetails: null,
			currentStep: "visitor",
		}));
		lastScannedRef.current = null;
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}
	};

	/**
	 * Handle redemption directly from review card
	 */
	const handleRedemptionFromReview = async (finalPrice: number) => {
		await handleAmountSubmit(finalPrice);
	};

	return (
		<div className="space-y-4">
			{/* Show result if redemption is complete */}
			{result ? (
				<RedemptionResultCard result={result} onReset={handleReset} />
			) : (
				<>
					{/* Scanned Info Card - Only show on voucher step (not on visitor step since review will show full details) */}
					{redemptionState.currentStep === "voucher" &&
						redemptionState.voucherUuid && (
							<ScannedInfoCard
								voucherUuid={redemptionState.voucherUuid}
								visitorId={null}
								voucherDetails={redemptionState.voucherDetails}
								visitorDetails={null}
								isLoadingVoucher={redemptionState.isLoadingVoucher}
								isLoadingVisitor={false}
								onClearVoucher={handleClearVoucher}
								onClearVisitor={undefined}
							/>
						)}

					{/* Step Content */}
					{redemptionState.currentStep === "voucher" ? (
						<RedemptionScanner
							key="voucher-scanner"
							currentStep="voucher"
							onScanSuccess={handleVoucherScan}
							scannedData={{
								voucherUuid: redemptionState.voucherUuid,
								visitorId: redemptionState.visitorId,
							}}
						/>
					) : redemptionState.currentStep === "visitor" ? (
						<RedemptionScanner
							key="visitor-scanner"
							currentStep="visitor"
							onScanSuccess={handleVisitorScan}
							scannedData={{
								voucherUuid: redemptionState.voucherUuid,
								visitorId: redemptionState.visitorId,
							}}
						/>
					) : redemptionState.currentStep === "review" ? (
						<RedemptionReviewCard
							voucherDetails={redemptionState.voucherDetails}
							visitorDetails={redemptionState.visitorDetails}
							onSubmit={handleRedemptionFromReview}
							onBack={handleClearVisitor}
							isProcessing={isProcessing}
						/>
					) : null}
				</>
			)}
		</div>
	);
}
