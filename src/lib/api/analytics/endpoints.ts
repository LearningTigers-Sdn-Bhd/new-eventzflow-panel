import { restClient } from "@/utils/rest-api";
import type {
	BackendTotalAmountPriceResponse,
	BackendTotalScannedTicketsResponse,
	BackendTotalTicketsResponse,
	BackendTotalUnscannedTicketsResponse,
} from "./response";

/**
 * Get global total tickets count
 */
export async function getGlobalTotalTickets(): Promise<number> {
	try {
		const response = await restClient.get<BackendTotalTicketsResponse>(
			"v1/metrics/total_tickets",
		);
		return response.totalTickets;
	} catch (error: any) {
		console.error("Error fetching global total tickets:", error);
		throw new Error(error.message || "Failed to fetch global total tickets");
	}
}

/**
 * Get global scanned tickets count
 */
export async function getGlobalScannedTickets(): Promise<number> {
	try {
		const response = await restClient.get<BackendTotalScannedTicketsResponse>(
			"v1/metrics/total_scanned_tickets",
		);
		return response.totalScannedTickets;
	} catch (error: any) {
		console.error("Error fetching global scanned tickets:", error);
		throw new Error(error.message || "Failed to fetch global scanned tickets");
	}
}

/**
 * Get global unscanned tickets count
 */
export async function getGlobalUnscannedTickets(): Promise<number> {
	try {
		const response = await restClient.get<BackendTotalUnscannedTicketsResponse>(
			"v1/metrics/total_unscanned_tickets",
		);
		return response.totalUnscannedTickets;
	} catch (error: any) {
		console.error("Error fetching global unscanned tickets:", error);
		throw new Error(
			error.message || "Failed to fetch global unscanned tickets",
		);
	}
}

/**
 * Get global total revenue (in cents)
 */
export async function getGlobalTotalRevenue(): Promise<number> {
	try {
		const response = await restClient.get<BackendTotalAmountPriceResponse>(
			"v1/metrics/total_amount_price",
		);
		return response.totalAmountPrice; // in cents
	} catch (error: any) {
		console.error("Error fetching global total revenue:", error);
		throw new Error(error.message || "Failed to fetch global total revenue");
	}
}
