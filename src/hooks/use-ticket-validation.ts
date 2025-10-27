/**
 * Ticket Validation Hook
 * Handles ticket check-in validation via REST API (online) or localStorage (offline)
 */

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
} from "@/components/pages/scan/constants";
import type { ScanResult } from "@/components/pages/scan/types";
import { playBeep } from "@/components/pages/scan/utils";
import { checkInTicket } from "@/lib/api/ticket";
import { useOfflineTicketValidation } from "./use-offline-ticket-validation";

export function useTicketValidation() {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isOnline, setIsOnline] = useState(
		typeof navigator !== "undefined" ? navigator.onLine : true,
	);
	const { validateTicketOffline, hasOfflineData } =
		useOfflineTicketValidation();

	// Listen for online/offline events
	if (typeof window !== "undefined") {
		window.addEventListener("online", () => setIsOnline(true));
		window.addEventListener("offline", () => setIsOnline(false));
	}

	/**
	 * Check if ticket is already scanned (from scanned IDs set)
	 */
	const checkLocalDuplicate = useCallback(
		(ticketId: string, scannedTicketIds: Set<string>): ScanResult | null => {
			const normalizedTicketId = ticketId.toLowerCase();
			const isDuplicate = scannedTicketIds.has(normalizedTicketId);

			console.log("🎫 Scan Check:", {
				ticketId,
				normalizedId: normalizedTicketId,
				isDuplicate,
				scannedIds: Array.from(scannedTicketIds),
			});

			if (isDuplicate) {
				return {
					ticketId,
					timestamp: new Date(),
					status: "duplicate",
					message: ERROR_MESSAGES.DUPLICATE_SCAN_SESSION,
				};
			}

			return null;
		},
		[],
	);

	/**
	 * Validate and check-in ticket via API (online) or offline data
	 */
	const validateTicket = useCallback(
		async (
			ticketId: string,
			scannedTicketIds: Set<string>,
		): Promise<ScanResult> => {
			// Check for local duplicate first (before any validation)
			const duplicateResult = checkLocalDuplicate(ticketId, scannedTicketIds);
			if (duplicateResult) {
				toast.error("Duplicate Scan", {
					description: duplicateResult.message,
				});
				playBeep(false);
				return duplicateResult;
			}

			// Check if offline mode should be used
			if (!isOnline) {
				if (!hasOfflineData()) {
					const errorResult: ScanResult = {
						ticketId,
						timestamp: new Date(),
						status: "error",
						message:
							"No internet connection and no offline data. Please sync when online.",
					};
					toast.error("Offline Mode", {
						description: errorResult.message,
					});
					playBeep(false);
					return errorResult;
				}

				// Use offline validation
				toast.info("Offline Mode", { description: "Using offline data" });
				const offlineResult = validateTicketOffline(ticketId, scannedTicketIds);
				if (offlineResult) {
					if (offlineResult.status !== "success") {
						playBeep(false);
					}
					return offlineResult;
				}
			}

			// Start processing
			setIsProcessing(true);

			try {
				// Check in the ticket via API
				const checkedInTicket = await checkInTicket(ticketId);

				// Create success result
				const result: ScanResult = {
					ticketId,
					timestamp: new Date(),
					status: "success",
					message: SUCCESS_MESSAGES.TICKET_CHECKED_IN,
					attendeeName: checkedInTicket.name,
					attendeeEmail: checkedInTicket.email,
					attendeePhone: checkedInTicket.phone,
					ticketType: checkedInTicket.ticketTypeName,
					ticketValue: checkedInTicket.value,
					checkedIn: true,
					checkInAt: checkedInTicket.checkInAt,
					eventName: checkedInTicket.eventName,
					eventId: checkedInTicket.eventId
						? Number.parseInt(checkedInTicket.eventId, 10)
						: undefined,
				};

				toast.success(SUCCESS_MESSAGES.TICKET_VALID, {
					description: `${checkedInTicket.name} • ${checkedInTicket.ticketTypeName}`,
				});

				playBeep(true);

				return result;
			} catch (error: any) {
				console.error("❌ Scan error:", error);

				// If network error and offline data available, fallback to offline
				const isNetworkError =
					error.message?.toLowerCase().includes("network") ||
					error.message?.toLowerCase().includes("fetch failed") ||
					error.code === "ECONNREFUSED";

				if (isNetworkError && hasOfflineData()) {
					toast.warning("Network Error", {
						description: "Switching to offline mode",
					});
					const offlineResult = validateTicketOffline(
						ticketId,
						scannedTicketIds,
					);
					if (offlineResult) {
						return offlineResult;
					}
				}

				// Check if this is a duplicate scan (already checked in)
				const isDuplicateError =
					error.message?.toLowerCase().includes("already") ||
					error.message?.toLowerCase().includes("checked in");

				// Handle error
				const result: ScanResult = {
					ticketId,
					timestamp: new Date(),
					status: isDuplicateError ? "duplicate" : "error",
					message: error.message || ERROR_MESSAGES.INVALID_TICKET,
				};

				if (isDuplicateError) {
					toast.error("Already Checked In", {
						description: error.message || ERROR_MESSAGES.DUPLICATE_SCAN_BACKEND,
					});
				} else {
					toast.error("Invalid Ticket", {
						description: error.message || ERROR_MESSAGES.INVALID_TICKET,
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
