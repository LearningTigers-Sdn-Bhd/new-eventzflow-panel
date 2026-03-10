import { z } from "zod";

/**
 * Schema for redeeming a voucher
 * POST /v1/voucher_redemptions
 */
export const redeemVoucherSchema = z.object({
	voucher_uuid: z.string().min(1, "Voucher UUID is required"),
	net_amount: z.number().nonnegative("Net amount must be zero or positive"),
	user_id: z.number().optional(),
	visitor_id: z.string().optional(),
	ticket_id: z.string().optional(),
});

export type RedeemVoucherRequest = z.infer<typeof redeemVoucherSchema>;
