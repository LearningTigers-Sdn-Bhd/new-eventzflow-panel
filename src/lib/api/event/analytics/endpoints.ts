import { restClient } from "@/utils/rest-api";
import {
	type GetEventAnalyticsRequest,
	type GetTimeSeriesRequest,
	getEventAnalyticsSchema,
	getTimeSeriesSchema,
} from "./request";
import type {
	AllEventAnalyticsResponse,
	DailyHourlyBreakdown,
	DateCountColumn,
	HourlyBreakdownByDayResponse,
	MallLiveFeedResponse,
	TimeSeriesResponse,
	TotalAmountPriceResponse,
	TotalScannedTicketsResponse,
	TotalScannedVisitorsResponse,
	TotalTicketsResponse,
	TotalUnscannedTicketsResponse,
	TotalUnscannedVisitorsResponse,
	TotalVisitorsResponse,
} from "./response";

/**
 * Convert time series response to legacy DateCountColumn format
 */
function toDateCountFormat(data: TimeSeriesResponse["data"]): DateCountColumn[] {
	if (Array.isArray(data)) {
		return data.map((d) => ({
			date: d.period,
			count: d.value,
		}));
	}

	return Object.entries(data ?? {}).map(([period, value]) => ({
		date: period,
		count: Number(value) || 0,
	}));
}

/**
 * Get time series data for an event
 */
export async function getTimeSeries(
	data: GetTimeSeriesRequest,
): Promise<TimeSeriesResponse> {
	try {
		const validated = getTimeSeriesSchema.parse(data);
		const params = new URLSearchParams();
		params.set("metric", validated.metric);
		if (validated.groupBy) params.set("group_by", validated.groupBy);
		if (validated.dateMode) params.set("date_mode", validated.dateMode);
		if (validated.startDate) params.set("start_date", validated.startDate);
		if (validated.endDate) params.set("end_date", validated.endDate);

		return await restClient.get<TimeSeriesResponse>(
			`v1/events/${validated.eventId}/metrics/time_series?${params.toString()}`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get time series for event ${data.eventId}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch time series data");
	}
}

/**
 * Aggregate all analytics in a single server-side call to reduce client requests
 */
export async function getAllEventAnalytics(
	data: GetEventAnalyticsRequest,
): Promise<AllEventAnalyticsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);
		const eventId = validated.id;

		// Build query params for time series
		const buildTimeSeriesUrl = (metric: string) => {
			const params = new URLSearchParams();
			params.set("metric", metric);
			if (validated.groupBy) params.set("group_by", validated.groupBy);
			if (validated.startDate) params.set("start_date", validated.startDate);
			if (validated.endDate) params.set("end_date", validated.endDate);
			return `v1/events/${eventId}/metrics/time_series?${params.toString()}`;
		};

		// Execute totals and time series in parallel
		const [
			totalTickets,
			totalScannedTickets,
			totalUnscannedTickets,
			totalAmountPrice,
			ticketsTimeSeries,
			scansTimeSeries,
			revenueTimeSeries,
		] = await Promise.all([
			restClient.get<TotalTicketsResponse>(
				`v1/events/${eventId}/metrics/total_tickets`,
			),
			restClient.get<TotalScannedTicketsResponse>(
				`v1/events/${eventId}/metrics/total_scanned_tickets`,
			),
			restClient.get<TotalUnscannedTicketsResponse>(
				`v1/events/${eventId}/metrics/total_unscanned_tickets`,
			),
			restClient.get<TotalAmountPriceResponse>(
				`v1/events/${eventId}/metrics/total_amount_price`,
			),
			restClient.get<TimeSeriesResponse>(buildTimeSeriesUrl("tickets")),
			restClient.get<TimeSeriesResponse>(buildTimeSeriesUrl("scans")),
			restClient.get<TimeSeriesResponse>(buildTimeSeriesUrl("revenue")),
		]);

		return {
			totalTickets: totalTickets.totalTickets,
			totalScannedTickets: totalScannedTickets.totalScannedTickets,
			totalUnscannedTickets: totalUnscannedTickets.totalUnscannedTickets,
			totalAmountPrice: totalAmountPrice.totalAmountPrice,
			registrationData: toDateCountFormat(ticketsTimeSeries.data ?? []),
			scanData: toDateCountFormat(scansTimeSeries.data ?? []),
			revenueData: toDateCountFormat(revenueTimeSeries.data ?? []),
		};
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
			`v1/events/${validated.id}/metrics/total_tickets`,
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
			`v1/events/${validated.id}/metrics/total_scanned_tickets`,
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
			`v1/events/${validated.id}/metrics/total_unscanned_tickets`,
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
			`v1/events/${validated.id}/metrics/total_amount_price`,
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
 * Get mall live feed data for an event
 */
export async function getMallLiveFeed(
	data: GetEventAnalyticsRequest,
): Promise<MallLiveFeedResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<MallLiveFeedResponse>(
			`v1/events/${validated.id}/metrics/mall_live_feed`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get mall live feed for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch mall live feed");
	}
}

/**
 * Get total visitors for an event
 */
export async function getTotalVisitors(
	data: GetEventAnalyticsRequest,
): Promise<TotalVisitorsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<TotalVisitorsResponse>(
			`v1/events/${validated.id}/metrics/total_visitors`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get total visitors for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch total visitors");
	}
}

/**
 * Get total scanned visitors for an event
 */
export async function getTotalScannedVisitors(
	data: GetEventAnalyticsRequest,
): Promise<TotalScannedVisitorsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<TotalScannedVisitorsResponse>(
			`v1/events/${validated.id}/metrics/total_scanned_visitors`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get total scanned visitors for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch total scanned visitors");
	}
}

/**
 * Get total unscanned visitors for an event
 */
export async function getTotalUnscannedVisitors(
	data: GetEventAnalyticsRequest,
): Promise<TotalUnscannedVisitorsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<TotalUnscannedVisitorsResponse>(
			`v1/events/${validated.id}/metrics/total_unscanned_visitors`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get total unscanned visitors for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch total unscanned visitors");
	}
}

/**
 * Get hourly breakdown by day for a specific event metric
 * Returns hourly data grouped by day - useful for multi-day event reports
 */
export async function getHourlyBreakdownByDay(
	eventId: number | string,
	metric: "tickets" | "scans" | "visitors" | "visitor_scans" | "stamps" | "redemptions",
	options?: {
		startDate?: string;
		endDate?: string;
		dateMode?: "all_time" | "pre_event";
	},
): Promise<DailyHourlyBreakdown[]> {
	try {
		const params = new URLSearchParams();
		params.set("metric", metric);
		if (options?.dateMode) params.set("date_mode", options.dateMode);
		if (options?.startDate) params.set("start_date", options.startDate);
		if (options?.endDate) params.set("end_date", options.endDate);

		const response = await restClient.get<HourlyBreakdownByDayResponse>(
			`v1/events/${eventId}/metrics/hourly_breakdown_by_day?${params.toString()}`,
		);

		return response.data ?? [];
	} catch (error: any) {
		console.error(
			`❌ Failed to get hourly breakdown for event ${eventId}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch hourly breakdown data");
	}
}
