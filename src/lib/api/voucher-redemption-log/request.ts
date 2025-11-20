import { z } from "zod";

/**
 * Schema for getting voucher redemption logs
 * GET /v1/events/:event_id/voucher_analytics/redemption_logs
 * event_id is required, vendor_id and voucher_id are optional filters
 */
export const getRedemptionLogsSchema = z.object({
	event_id: z.number(),
	vendor_id: z.number().optional(),
	voucher_id: z.number().optional(),
});

export type GetRedemptionLogsRequest = z.infer<typeof getRedemptionLogsSchema>;
