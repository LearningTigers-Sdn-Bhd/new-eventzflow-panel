import { restClient } from "@/utils/rest-api";
import type {
	BackendTotalAmountPriceResponse,
	BackendTotalScannedTicketsResponse,
	BackendTotalTicketsResponse,
	BackendTotalUnscannedTicketsResponse,
	BackendWeeklyRegisteredTicketsResponse,
	BackendWeeklySalesAmountResponse,
	BackendWeeklyScannedTicketsResponse,
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

/**
 * Get weekly registered tickets data
 */
export async function getWeeklyRegisteredTickets(): Promise<
	{ date: string; count: number }[]
> {
	try {
		const response =
        await restClient.get<BackendWeeklyRegisteredTicketsResponse>(
            "v1/metrics/weekly_registered",
        );
		return response.weeklyRegisteredTickets;
	} catch (error: any) {
		console.error("Error fetching weekly registered tickets:", error);
		throw new Error(
			error.message || "Failed to fetch weekly registered tickets",
		);
	}
}

/**
 * Get weekly scanned tickets data
 */
export async function getWeeklyScannedTickets(): Promise<
	{ date: string; count: number }[]
> {
	try {
    const response = await restClient.get<BackendWeeklyScannedTicketsResponse>(
        "v1/metrics/weekly_scanned",
    );
		return response.weeklyScannedTickets;
	} catch (error: any) {
		console.error("Error fetching weekly scanned tickets:", error);
		throw new Error(error.message || "Failed to fetch weekly scanned tickets");
	}
}

/**
 * Get weekly sales amount data
 */
export async function getWeeklySalesAmount(): Promise<
	{ date: string; count: number }[]
> {
	try {
    const response = await restClient.get<BackendWeeklySalesAmountResponse>(
        "v1/metrics/weekly_sales_amount",
    );
		return response.weeklySalesAmount;
	} catch (error: any) {
		console.error("Error fetching weekly sales amount:", error);
		throw new Error(error.message || "Failed to fetch weekly sales amount");
	}
}
