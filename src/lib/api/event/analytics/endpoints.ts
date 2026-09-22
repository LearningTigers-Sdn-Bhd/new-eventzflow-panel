import { restClient } from "@/utils/rest-api";
import {
	type GetEventAnalyticsRequest,
	type GetTimeSeriesRequest,
	getEventAnalyticsSchema,
	getTimeSeriesSchema,
} from "./request";
import type {
	AllEventAnalyticsResponse,
	CustomFieldBreakdownResponse,
	CustomFieldKeysResponse,
	DailyHourlyBreakdown,
	DateCountColumn,
	HourlyBreakdownByDayResponse,
	MallLiveFeedResponse,
	NestedCustomFieldBreakdownResponse,
	PartnerAnalyticsResponse,
	TicketTypeBreakdownResponse,
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
function toDateCountFormat(
	data: TimeSeriesResponse["data"],
): DateCountColumn[] {
	return data.map((d) => ({
		date: d.period,
		count: d.value,
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
		if (validated.includeMultiScans) params.set("include_multi_scans", "true");

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
			paidTickets: totalTickets.paidTickets,
			pendingTickets: totalTickets.pendingTickets,
			totalScannedTickets: totalScannedTickets.totalScannedTickets,
			totalUnscannedTickets: totalUnscannedTickets.totalUnscannedTickets,
			totalAmountPrice: totalAmountPrice.totalAmountPrice,
			pendingAmountPrice: totalAmountPrice.pendingAmountPrice,
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
		const params = new URLSearchParams();
		if (validated.includeMultiScans) params.set("include_multi_scans", "true");

		return await restClient.get<TotalScannedTicketsResponse>(
			`v1/events/${validated.id}/metrics/total_scanned_tickets?${params.toString()}`,
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
 * Get exhibitor analytics, or vendor analytics for non-exhibitor events.
 */
export async function getExhibitorAnalytics(
	data: GetEventAnalyticsRequest,
): Promise<PartnerAnalyticsResponse> {
	try {
		const validated = getEventAnalyticsSchema.parse(data);

		return await restClient.get<PartnerAnalyticsResponse>(
			`v1/events/${validated.id}/metrics/exhibitor_analytics`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get exhibitor analytics for event ${data.id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch exhibitor analytics");
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
		const params = new URLSearchParams();
		if (validated.includeMultiScans) params.set("include_multi_scans", "true");

		return await restClient.get<TotalScannedVisitorsResponse>(
			`v1/events/${validated.id}/metrics/total_scanned_visitors?${params.toString()}`,
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
		throw new Error(
			error.message || "Failed to fetch total unscanned visitors",
		);
	}
}

/**
 * Get hourly breakdown by day for a specific event metric
 * Returns hourly data grouped by day - useful for multi-day event reports
 */
export async function getHourlyBreakdownByDay(
	eventId: number | string,
	metric:
		| "tickets"
		| "scans"
		| "visitors"
		| "visitor_scans"
		| "stamps"
		| "redemptions",
	options?: {
		startDate?: string;
		endDate?: string;
		dateMode?: "all_time" | "pre_event";
		includeMultiScans?: boolean;
	},
): Promise<DailyHourlyBreakdown[]> {
	try {
		const params = new URLSearchParams();
		params.set("metric", metric);
		if (options?.dateMode) params.set("date_mode", options.dateMode);
		if (options?.startDate) params.set("start_date", options.startDate);
		if (options?.endDate) params.set("end_date", options.endDate);
		if (options?.includeMultiScans) params.set("include_multi_scans", "true");

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

/**
 * Auto-detect the custom_fields_data jsonb keys actually used by this
 * event's tickets, for a dropdown instead of manual typing.
 */
export async function getCustomFieldKeys(
	eventId: number | string,
): Promise<CustomFieldKeysResponse> {
	try {
		return await restClient.get<CustomFieldKeysResponse>(
			`v1/events/${eventId}/metrics/custom_field_keys`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get custom field keys for event ${eventId}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch custom field keys");
	}
}

/**
 * Get count-only breakdown of tickets grouped by a custom_fields_data jsonb key.
 * Works for any event/field — the field key is not hardcoded.
 */
export async function getCustomFieldBreakdown(
	eventId: number | string,
	fieldKey: string,
	groupBy?: string,
): Promise<CustomFieldBreakdownResponse | NestedCustomFieldBreakdownResponse> {
	try {
		const params = new URLSearchParams();
		params.set("field_key", fieldKey);
		if (groupBy) params.set("group_by", groupBy);

		return await restClient.get<
			CustomFieldBreakdownResponse | NestedCustomFieldBreakdownResponse
		>(
			`v1/events/${eventId}/metrics/custom_field_breakdown?${params.toString()}`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get custom field breakdown for event ${eventId}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch custom field breakdown");
	}
}

/**
 * Set (upsert) the registration quota for one field_key/value pair (e.g. an
 * agency's allotted headcount). Informational only — never blocks registration.
 */
export async function setCustomFieldQuota(
	eventId: number | string,
	fieldKey: string,
	value: string,
	quota: number,
): Promise<{ fieldKey: string; value: string; quota: number }> {
	try {
		return await restClient.put<{
			fieldKey: string;
			value: string;
			quota: number;
		}>(`v1/events/${eventId}/metrics/custom_field_quota`, {
			field_key: fieldKey,
			value,
			quota,
		});
	} catch (error: any) {
		console.error(
			`❌ Failed to set custom field quota for event ${eventId}:`,
			error,
		);
		throw new Error(error.message || "Failed to set custom field quota");
	}
}

/**
 * Clear a previously set quota for one field_key/value pair, reverting that
 * row back to a plain count in the breakdown.
 */
export async function deleteCustomFieldQuota(
	eventId: number | string,
	fieldKey: string,
	value: string,
): Promise<{ fieldKey: string; value: string }> {
	try {
		return await restClient.delete<{ fieldKey: string; value: string }>(
			`v1/events/${eventId}/metrics/custom_field_quota`,
			{ field_key: fieldKey, value },
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to delete custom field quota for event ${eventId}:`,
			error,
		);
		throw new Error(error.message || "Failed to delete custom field quota");
	}
}

/**
 * Get count-only breakdown of tickets grouped by ticket type.
 */
export async function getTicketTypeBreakdown(
	eventId: number | string,
): Promise<TicketTypeBreakdownResponse> {
	try {
		return await restClient.get<TicketTypeBreakdownResponse>(
			`v1/events/${eventId}/metrics/ticket_type_breakdown`,
		);
	} catch (error: any) {
		console.error(
			`❌ Failed to get ticket type breakdown for event ${eventId}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch ticket type breakdown");
	}
}

/**
 * Download all of the event's tickets as CSV, for offline charting/analysis
 * from the custom dashboard. Honors the Content-Disposition filename when
 * the backend provides one.
 */
export async function exportTicketsCsv(
	eventId: number | string,
): Promise<void> {
	try {
		const { blob, headers } = await restClient.getBlob(
			`v1/events/${eventId}/tickets/export.csv`,
		);

		let filename = `event-${eventId}-tickets.csv`;
		const contentDisposition = headers.get("Content-Disposition");
		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
			if (filenameMatch) filename = filenameMatch[1];
		}

		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Failed to export tickets CSV";
		console.error(
			`❌ Failed to export tickets CSV for event ${eventId}:`,
			error,
		);
		throw new Error(message);
	}
}
