/**
 * Backend API response types for voucher redemption
 */

/**
 * Backend response from POST /v1/voucher_redemptions
 */
export type BackendRedeemVoucherResponse = {
	success: boolean;
	message: string;
	data: {
		net_amount: string; // Decimal as string from backend
		discount_applied: string; // Decimal as string from backend
		voucher_type: number; // 0 = fixed_amount, 1 = percentage, 2 = free_item
	};
};

/**
 * Frontend voucher redemption response type
 */
export type VoucherRedemptionResponse = {
	success: boolean;
	message: string;
	netAmount: number;
	discountApplied: number;
	voucherType: "fixed_amount" | "percentage" | "free_item";
};

/**
 * Error response from backend
 */
export type VoucherRedemptionErrorResponse = {
	success: false;
	message: string;
};
