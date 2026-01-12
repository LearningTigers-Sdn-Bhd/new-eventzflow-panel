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
	const hasOfflineData = useCallback((): boolean => {
		try {
			const tickets = localStorage.getItem(STORAGE_CONFIG.OFFLINE_TICKETS_KEY);
			return !!tickets && JSON.parse(tickets).length > 0;
		} catch {
			return false;
		}
	}, []);

	const validateTicketOffline = useCallback(
		(scanId: string, scannedIds: Set<string>): ScanResult | null => {
			try {
				const normalizedId = scanId.toLowerCase();
				if (scannedIds.has(normalizedId)) {
					return {
						scanId,
						timestamp: new Date(),
						status: "duplicate",
						message: ERROR_MESSAGES.DUPLICATE_SCAN_SESSION,
						type: "ticket",
					};
				}

				const ticketsData = localStorage.getItem(
					STORAGE_CONFIG.OFFLINE_TICKETS_KEY,
				);
				if (!ticketsData) {
					return {
						scanId,
						timestamp: new Date(),
						status: "error",
						message: "No offline data available. Please sync first.",
						type: "ticket",
					};
				}

				const tickets: OfflineTicket[] = JSON.parse(ticketsData);
				const ticket = tickets.find(
					(t) => t.publicId.toLowerCase() === normalizedId,
				);

				if (!ticket) {
					return {
						scanId,
						timestamp: new Date(),
						status: "error",
						message: "Ticket not found in offline database",
						type: "ticket",
					};
				}

				if (ticket.checkedIn) {
					return {
						scanId,
						timestamp: new Date(),
						status: "duplicate",
						message: ERROR_MESSAGES.DUPLICATE_SCAN_BACKEND,
						name: ticket.name,
						email: ticket.email,
						phone: ticket.phone,
						ticketType: ticket.ticketTypeName,
						eventName: ticket.eventName,
						eventId: ticket.eventId,
						type: "ticket",
					};
				}

				ticket.checkedIn = true;
				ticket.checkInAt = new Date().toISOString();
				localStorage.setItem(
					STORAGE_CONFIG.OFFLINE_TICKETS_KEY,
					JSON.stringify(tickets),
				);

				const result: ScanResult = {
					scanId,
					timestamp: new Date(),
					status: "success",
					message: `${SUCCESS_MESSAGES.TICKET_CHECKED_IN} (Offline)`,
					type: "ticket",
					name: ticket.name,
					email: ticket.email,
					phone: ticket.phone,
					ticketType: ticket.ticketTypeName,
					ticketValue: ticket.value,
					checkedIn: true,
					checkInAt: ticket.checkInAt,
					eventName: ticket.eventName,
					eventId: ticket.eventId,
				};

				toast.success("Valid Ticket (Offline)", {
					description: `${ticket.name} • ${ticket.ticketTypeName || "Standard"}`,
				});

				playBeep(true);

				return result;
			} catch (error) {
				console.error("Offline validation error:", error);
				return {
					scanId,
					timestamp: new Date(),
					status: "error",
					message: "Offline validation failed",
					type: "ticket",
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
