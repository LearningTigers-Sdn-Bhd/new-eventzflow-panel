/**
 * Offline Ticket Validation Hook
 * Validates tickets from localStorage when offline
 */

import { useCallback } from "react";
import { toast } from "sonner";
import {
	ERROR_MESSAGES,
	STORAGE_CONFIG,
	SUCCESS_MESSAGES,
} from "@/components/pages/scan/constants";
import type { ScanResult } from "@/components/pages/scan/types";
import { playBeep } from "@/components/pages/scan/utils";

interface OfflineTicket {
	publicId: string;
	eventId: number;
	eventName: string;
	name: string;
	email: string;
	phone: string;
	ticketTypeName?: string;
	value: number;
	checkedIn?: boolean;
	checkInAt?: string | null;
}

export function useOfflineTicketValidation() {
	/**
	 * Check if offline data is available
	 */
	const hasOfflineData = useCallback((): boolean => {
		try {
			const tickets = localStorage.getItem(STORAGE_CONFIG.OFFLINE_TICKETS_KEY);
			return !!tickets && JSON.parse(tickets).length > 0;
		} catch {
			return false;
		}
	}, []);

	/**
	 * Validate ticket against offline data
	 */
	const validateTicketOffline = useCallback(
		(ticketId: string, scannedTicketIds: Set<string>): ScanResult | null => {
			try {
				// Check local duplicate first
				const normalizedTicketId = ticketId.toLowerCase();
				if (scannedTicketIds.has(normalizedTicketId)) {
					return {
						ticketId,
						timestamp: new Date(),
						status: "duplicate",
						message: ERROR_MESSAGES.DUPLICATE_SCAN_SESSION,
					};
				}

				// Load offline tickets
				const ticketsData = localStorage.getItem(
					STORAGE_CONFIG.OFFLINE_TICKETS_KEY,
				);
				if (!ticketsData) {
					return {
						ticketId,
						timestamp: new Date(),
						status: "error",
						message: "No offline data available. Please sync first.",
					};
				}

				const tickets: OfflineTicket[] = JSON.parse(ticketsData);
				const ticket = tickets.find(
					(t) => t.publicId.toLowerCase() === normalizedTicketId,
				);

				if (!ticket) {
					return {
						ticketId,
						timestamp: new Date(),
						status: "error",
						message: "Ticket not found in offline database",
					};
				}

				// Check if already checked in (from offline data)
				if (ticket.checkedIn) {
					return {
						ticketId,
						timestamp: new Date(),
						status: "duplicate",
						message: ERROR_MESSAGES.DUPLICATE_SCAN_BACKEND,
						attendeeName: ticket.name,
						attendeeEmail: ticket.email,
						attendeePhone: ticket.phone,
						ticketType: ticket.ticketTypeName,
						eventName: ticket.eventName,
						eventId: ticket.eventId,
					};
				}

				// Mark as checked in in offline data
				ticket.checkedIn = true;
				ticket.checkInAt = new Date().toISOString();
				localStorage.setItem(
					STORAGE_CONFIG.OFFLINE_TICKETS_KEY,
					JSON.stringify(tickets),
				);

				// Create success result
				const result: ScanResult = {
					ticketId,
					timestamp: new Date(),
					status: "success",
					message: `${SUCCESS_MESSAGES.TICKET_CHECKED_IN} (Offline)`,
					attendeeName: ticket.name,
					attendeeEmail: ticket.email,
					attendeePhone: ticket.phone,
					ticketType: ticket.ticketTypeName,
					ticketValue: ticket.value,
					checkedIn: true,
					checkInAt: ticket.checkInAt,
					eventName: ticket.eventName,
					eventId: ticket.eventId,
				};

				toast.success("✓ Valid Ticket (Offline)", {
					description: `${ticket.name} • ${ticket.ticketTypeName || "Standard"}`,
				});

				playBeep(true);

				return result;
			} catch (error: any) {
				console.error("❌ Offline validation error:", error);
				return {
					ticketId,
					timestamp: new Date(),
					status: "error",
					message: "Offline validation failed",
				};
			}
		},
		[],
	);

	return {
		validateTicketOffline,
		hasOfflineData,
	};
}
