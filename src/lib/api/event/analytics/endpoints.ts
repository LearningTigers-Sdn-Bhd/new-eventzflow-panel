import { restClient } from "@/utils/rest-api";
import {
	type GetEventAnalyticsRequest,
	getEventAnalyticsSchema,
} from "./request";
import type {
	AllEventAnalyticsResponse,
	TotalAmountPriceResponse,
	TotalScannedTicketsResponse,
	TotalTicketsResponse,
	TotalUnscannedTicketsResponse,
	WeeklyRegisteredTicketsResponse,
	WeeklySalesAmountResponse,
	WeeklyScannedTicketsResponse,
} from "./response";

/**
 * Aggregate all analytics in a single server-side call to reduce client requests
 */
export async function getAllEventAnalytics(
	data: GetEventAnalyticsRequest,
): Promise<AllEventAnalyticsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);
		const eventId = validated.id;

		console.log(`🔄 Starting analytics fetch for event ${eventId}`);

		// Execute first endpoint separately
		console.log("📊 Fetching first endpoint - total tickets...");
		const totalTickets = await restClient.get<TotalTicketsResponse>(
			`v1/events/${eventId}/analytics/total_tickets`,
		);
		console.log(`✅ Total tickets fetched: ${totalTickets.totalTickets}`);

		// Execute remaining 6 endpoints in parallel
		console.log("📊 Fetching remaining 6 analytics endpoints in parallel...");
		const [
			totalScannedTickets,
			totalUnscannedTickets,
			totalAmountPrice,
			weeklyRegisteredTickets,
			weeklyScannedTickets,
			weeklySalesAmount,
		] = await Promise.all([
			restClient.get<TotalScannedTicketsResponse>(
				`v1/events/${eventId}/analytics/total_scanned_tickets`,
			),
			restClient.get<TotalUnscannedTicketsResponse>(
				`v1/events/${eventId}/analytics/total_unscanned_tickets`,
			),
			restClient.get<TotalAmountPriceResponse>(
				`v1/events/${eventId}/analytics/total_amount_price`,
			),
			restClient.get<WeeklyRegisteredTicketsResponse>(
				`v1/events/${eventId}/analytics/weekly_registered_tickets`,
			),
			restClient.get<WeeklyScannedTicketsResponse>(
				`v1/events/${eventId}/analytics/weekly_scanned_tickets`,
			),
			restClient.get<WeeklySalesAmountResponse>(
				`v1/events/${eventId}/analytics/weekly_sales_amount`,
			),
		]);

		console.log("✅ Remaining 6 endpoints completed successfully");
		console.log(`🎉 All analytics fetched successfully for event ${eventId}`);

		return {
			totalTickets: totalTickets.totalTickets,
			totalScannedTickets: totalScannedTickets.totalScannedTickets,
			totalUnscannedTickets: totalUnscannedTickets.totalUnscannedTickets,
			totalAmountPrice: totalAmountPrice.totalAmountPrice,
			weeklyRegisteredTickets: weeklyRegisteredTickets.weeklyRegisteredTickets,
			weeklyScannedTickets: weeklyScannedTickets.weeklyScannedTickets,
			weeklySalesAmount: weeklySalesAmount.weeklySalesAmount,
		} as const;
	} catch (error: any) {
		console.error(`❌ Failed to get analytics for event ${data.id}:`, error);
		throw new Error(error.message || "Failed to fetch event analytics");
	}
}

/**
 * Get total tickets for an event
 */
export async function getTotalTickets(
	data: GetEventAnalyticsRequest,
): Promise<TotalTicketsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<TotalTicketsResponse>(
			`v1/events/${validated.id}/analytics/total_tickets`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get total tickets for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch total tickets");
	}
}

/**
 * Get total scanned tickets for an event
 */
export async function getTotalScannedTickets(
	data: GetEventAnalyticsRequest,
): Promise<TotalScannedTicketsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<TotalScannedTicketsResponse>(
			`v1/events/${validated.id}/analytics/total_scanned_tickets`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get total scanned tickets for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch total scanned tickets");
	}
}

/**
 * Get total unscanned tickets for an event
 */
export async function getTotalUnscannedTickets(
	data: GetEventAnalyticsRequest,
): Promise<TotalUnscannedTicketsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<TotalUnscannedTicketsResponse>(
			`v1/events/${validated.id}/analytics/total_unscanned_tickets`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get total unscanned tickets for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch total unscanned tickets");
	}
}

/**
 * Get total amount price for an event
 */
export async function getTotalAmountPrice(
	data: GetEventAnalyticsRequest,
): Promise<TotalAmountPriceResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<TotalAmountPriceResponse>(
			`v1/events/${validated.id}/analytics/total_amount_price`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get total amount price for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch total amount price");
	}
}

/**
 * Get weekly registered tickets for an event
 */
export async function getWeeklyRegisteredTickets(
	data: GetEventAnalyticsRequest,
): Promise<WeeklyRegisteredTicketsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<WeeklyRegisteredTicketsResponse>(
			`v1/events/${validated.id}/analytics/weekly_registered_tickets`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get weekly registered tickets for event ${data.id}:`,
			error,
		);
		throw new Error(
			error.message || "Failed to fetch weekly registered tickets",
		);
	}
}

/**
 * Get weekly scanned tickets for an event
 */
export async function getWeeklyScannedTickets(
	data: GetEventAnalyticsRequest,
): Promise<WeeklyScannedTicketsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<WeeklyScannedTicketsResponse>(
			`v1/events/${validated.id}/analytics/weekly_scanned_tickets`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get weekly scanned tickets for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch weekly scanned tickets");
	}
}

/**
 * Get weekly sales amount for an event
 */
export async function getWeeklySalesAmount(
	data: GetEventAnalyticsRequest,
): Promise<WeeklySalesAmountResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<WeeklySalesAmountResponse>(
			`v1/events/${validated.id}/analytics/weekly_sales_amount`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get weekly sales amount for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch weekly sales amount");
	}
}
