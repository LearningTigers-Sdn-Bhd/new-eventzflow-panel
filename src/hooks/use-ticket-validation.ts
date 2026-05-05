/**
 * Scan Validation Hook
 * Handles unified check-in validation for both tickets and visitors
 * via REST API (online) or localStorage (offline)
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
} from "@/components/pages/scan/constants";
import { mapScanInvalidReason } from "@/components/pages/scan/status-helpers";
import type { ScanResult } from "@/components/pages/scan/types";
import { playBeep } from "@/components/pages/scan/utils";
import type { ScanType } from "@/lib/api/scan";
import { checkIn, ScanCheckInError } from "@/lib/api/scan";
import { useOfflineTicketValidation } from "./use-offline-ticket-validation";

export function useTicketValidation() {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isOnline, setIsOnline] = useState(
		typeof navigator !== "undefined" ? navigator.onLine : true,
	);
	const { validateTicketOffline, hasOfflineData } =
		useOfflineTicketValidation();

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	const checkLocalDuplicate = useCallback(
		(scanId: string, scannedIds: Set<string>): ScanResult | null => {
			const normalizedId = scanId.toLowerCase();
			const isDuplicate = scannedIds.has(normalizedId);

			if (isDuplicate) {
				return {
					scanId,
					timestamp: new Date(),
					status: "duplicate",
					message: ERROR_MESSAGES.DUPLICATE_SCAN_SESSION,
					type: "ticket",
				};
			}

			return null;
		},
		[],
	);

	const validateTicket = useCallback(
		async (scanId: string, scannedIds: Set<string>): Promise<ScanResult> => {
			const duplicateResult = checkLocalDuplicate(scanId, scannedIds);
			if (duplicateResult) {
				toast.error("Duplicate Scan", {
					description: duplicateResult.message,
				});
				playBeep(false);
				return duplicateResult;
			}

			if (!isOnline) {
				if (!hasOfflineData()) {
					const errorResult: ScanResult = {
						scanId,
						timestamp: new Date(),
						status: "error",
						message:
							"No internet connection and no offline data. Please sync when online.",
						type: "ticket",
					};
					toast.error("Offline Mode", {
						description: errorResult.message,
					});
					playBeep(false);
					return errorResult;
				}

				toast.info("Offline Mode", { description: "Using offline data" });
				const offlineResult = validateTicketOffline(scanId, scannedIds);
				if (offlineResult) {
					if (offlineResult.status !== "success") {
						playBeep(false);
					}
					return offlineResult;
				}
			}

			setIsProcessing(true);

			try {
				const response = await checkIn(scanId);

				const isTicket = response.type === "ticket";
				const typeLabel = isTicket ? "Ticket" : "Visitor";
				const detailLabel =
					isTicket && response.ticketType
						? response.ticketType.name
						: response.type;

				const result: ScanResult = {
					scanId,
					timestamp: new Date(),
					status: "success",
					message: `${typeLabel} checked in successfully`,
					type: response.type,
					role: response.role,
					name: response.name,
					email: response.email,
					phone: response.phone,
					ticketType: response.ticketType?.name,
					ticketValue: response.ticketType?.price,
					checkedIn: true,
					checkInAt: response.checkInAt,
					eventName: response.eventName,
					eventId: response.eventId,
					gender: response.gender,
					age: response.age,
				};

				toast.success(SUCCESS_MESSAGES.TICKET_VALID, {
					description: `${response.name} • ${detailLabel}`,
				});

				playBeep(true);

				return result;
			} catch (error: unknown) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				const scanType: ScanType =
					error instanceof ScanCheckInError && error.type
						? error.type
						: "ticket";
				const mappedReasonMessage =
					error instanceof ScanCheckInError
						? mapScanInvalidReason(error.invalidReason, {
								currentDayIndex: error.currentDayIndex,
								allowedDayIndexes: error.allowedDayIndexes,
							})
						: null;
				const displayMessage = mappedReasonMessage || errorMessage;
				const typeLabel = scanType === "visitor" ? "Visitor" : "Ticket";

				const isNetworkError =
					errorMessage.toLowerCase().includes("network") ||
					errorMessage.toLowerCase().includes("fetch failed");

				if (isNetworkError && hasOfflineData()) {
					toast.warning("Network Error", {
						description: "Switching to offline mode",
					});
					const offlineResult = validateTicketOffline(scanId, scannedIds);
					if (offlineResult) {
						return offlineResult;
					}
				}

				const isDuplicateError =
					errorMessage.toLowerCase().includes("already") ||
					errorMessage.toLowerCase().includes("checked in") ||
					(error instanceof ScanCheckInError &&
						error.invalidReason === "already_checked_in_today");

				const result: ScanResult = {
					scanId,
					timestamp: new Date(),
					status: isDuplicateError ? "duplicate" : "error",
					message: displayMessage || ERROR_MESSAGES.INVALID_TICKET,
					type: scanType,
				};

				if (isDuplicateError) {
					toast.error("Already Checked In", {
						description: `This ${typeLabel.toLowerCase()} has already been checked in`,
					});
				} else {
					toast.error("Invalid QR Code", {
						description: displayMessage || "Record not found. Invalid QR code.",
					});
				}

				playBeep(false);

				return result;
			} finally {
				setIsProcessing(false);
			}
		},
		[checkLocalDuplicate, isOnline, hasOfflineData, validateTicketOffline],
	);

	return {
		validateTicket,
		isProcessing,
		isOnline,
		hasOfflineData: hasOfflineData(),
	};
}
