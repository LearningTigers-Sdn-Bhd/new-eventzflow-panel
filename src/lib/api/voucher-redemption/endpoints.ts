import { restClient } from "@/utils/rest-api";
import type {
	BackendRedeemVoucherResponse,
	VoucherRedemptionResponse,
} from "./response";
import {
	type RedeemVoucherRequest,
	redeemVoucherSchema,
} from "./request";

/**
 * Transform backend voucher type to frontend format
 * Backend: 0 = fixed_amount, 1 = percentage, 2 = free_item
 */
function transformVoucherType(
	backendType: number,
): "fixed_amount" | "percentage" | "free_item" {
	const typeMap: Record<number, "fixed_amount" | "percentage" | "free_item"> = {
		0: "fixed_amount",
		1: "percentage",
		2: "free_item",
	};
	return typeMap[backendType] || "fixed_amount";
}

/**
 * Transform backend redemption response to frontend format
 */
function transformRedemptionResponse(
	backendResponse: BackendRedeemVoucherResponse,
): VoucherRedemptionResponse {
	return {
		success: backendResponse.success,
		message: backendResponse.message,
		netAmount: Number.parseFloat(backendResponse.data.net_amount),
		discountApplied: Number.parseFloat(backendResponse.data.discount_applied),
		voucherType: transformVoucherType(backendResponse.data.voucher_type),
	};
}

/**
 * Redeem a voucher
 * POST /v1/voucher_redemptions
 *
 * @param data - Redemption request data
 * @returns Promise resolving to the redemption response
 * @throws Error if redemption fails
 */
export async function redeemVoucher(
	data: RedeemVoucherRequest,
): Promise<VoucherRedemptionResponse> {
	try {
		// Validate request data
		const validated = redeemVoucherSchema.parse(data);

		// Make API request
		const response = await restClient.post<BackendRedeemVoucherResponse>(
			"v1/voucher_redemptions",
			{
				voucher_redemption: {
					voucher_uuid: validated.voucher_uuid,
					net_amount: validated.net_amount,
					...(validated.user_id && { user_id: validated.user_id }),
					...(validated.visitor_id && { visitor_id: validated.visitor_id }),
				},
			},
		);

		// Transform and return response
		return transformRedemptionResponse(response);
	} catch (error: unknown) {
		console.error("Error redeeming voucher:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to redeem voucher";
		throw new Error(errorMessage);
	}
}
