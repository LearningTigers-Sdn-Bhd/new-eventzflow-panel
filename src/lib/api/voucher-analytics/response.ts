/**
 * Response types for voucher analytics API
 */

/**
 * Daily redemption trend data point
 */
export type DailyRedemptionTrend = {
	date: string;
	count: number;
};

/**
 * Top scanned voucher data
 */
export type TopScannedVoucher = {
	voucher_id: number;
	voucher_title: string;
	voucher_code: string;
	redemption_count: number;
};

/**
 * Latest redemption transaction
 */
export type LatestRedemptionTransaction = {
	id: number;
	voucher_title: string;
	voucher_code: string;
	vendor_name: string;
	redeemer_name: string;
	redeemer_type: string;
	redemption_timestamp: string;
	transaction_gross_amount: string;
	discount_applied_value: string;
	transaction_net_amount: string;
	redemption_status: string;
};

/**
 * Backend response from GET /v1/events/:event_id/voucher_analytics
 */
export type BackendVoucherAnalyticsResponse = {
	total_vouchers_issued: number;
	total_redemptions: number;
	event_redemption_rate: number;
	total_discount_value: string; // Decimal as string
	total_sales: string; // Decimal as string
	daily_redemption_trend: DailyRedemptionTrend[];
	top_scanned_vouchers: TopScannedVoucher[] | Record<string, number>; // Can be array or hash
	latest_redemption_transactions: LatestRedemptionTransaction[];
};

/**
 * Frontend voucher analytics response (transformed from backend)
 */
export type VoucherAnalyticsResponse = {
	totalVouchersIssued: number;
	totalRedemptions: number;
	eventRedemptionRate: number;
	totalDiscountValue: number; // Converted to number
	totalSales: number; // Converted to number
	dailyRedemptionTrend: DailyRedemptionTrend[];
	topScannedVouchers: TopScannedVoucher[];
	latestRedemptionTransactions: LatestRedemptionTransaction[];
};

