import { restClient } from "@/utils/rest-api";
import {
	type GetVoucherAnalyticsRequest,
	getVoucherAnalyticsSchema,
} from "./request";
import type {
	BackendVoucherAnalyticsResponse,
	VoucherAnalyticsResponse,
} from "./response";

/**
 * Get voucher analytics for an event
 * GET /v1/events/:event_id/voucher_analytics
 *
 * @param params - Required event_id, optional vendor_id to filter by vendor
 * @returns Promise resolving to voucher analytics data
 * @throws Error if request fails
 */
export async function getVoucherAnalytics(
	params: GetVoucherAnalyticsRequest,
): Promise<VoucherAnalyticsResponse> {
	try {
		// Validate request data
		const validated = getVoucherAnalyticsSchema.parse(params);

		// event_id is required
		if (!validated.event_id) {
			throw new Error("event_id is required");
		}

		// Build URL with optional vendor_id query parameter
		const queryParams = new URLSearchParams();
		if (validated.vendor_id) {
			queryParams.append("vendor_id", validated.vendor_id.toString());
		}

		const baseUrl = `v1/events/${validated.event_id}/voucher_analytics`;
		const url = queryParams.toString()
			? `${baseUrl}?${queryParams.toString()}`
			: baseUrl;

		// Make API request
		const response =
			await restClient.get<BackendVoucherAnalyticsResponse>(url);

		// Transform backend response to frontend format
		// Transform top_scanned_vouchers from hash to array
		const topScannedVouchers = Array.isArray(response.top_scanned_vouchers)
			? response.top_scanned_vouchers
			: Object.entries(response.top_scanned_vouchers || {}).map(
					([title, count], index) => ({
						voucher_id: index + 1,
						voucher_title: title,
						voucher_code: "",
						redemption_count: count as number,
					}),
				);

		return {
			totalVouchersIssued: response.total_vouchers_issued,
			totalRedemptions: response.total_redemptions,
			eventRedemptionRate: response.event_redemption_rate,
			totalDiscountValue: parseFloat(response.total_discount_value),
			totalSales: parseFloat(response.total_sales),
			dailyRedemptionTrend: response.daily_redemption_trend,
			topScannedVouchers: topScannedVouchers,
			latestRedemptionTransactions: response.latest_redemption_transactions,
		};
	} catch (error: any) {
		console.error(
			`❌ Failed to get voucher analytics for event ${params.event_id}:`,
			error,
		);
		throw new Error(error.message || "Failed to fetch voucher analytics");
	}
}

