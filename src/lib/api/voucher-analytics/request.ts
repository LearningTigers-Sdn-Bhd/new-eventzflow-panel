import { z } from "zod";

/**
 * Schema for getting voucher analytics for an event
 * GET /v1/events/:event_id/voucher_analytics
 * Optional vendor_id parameter to filter analytics for a specific vendor
 */
export const getVoucherAnalyticsSchema = z.object({
	event_id: z.number(),
	vendor_id: z.number().optional(),
});

export type GetVoucherAnalyticsRequest = z.infer<
	typeof getVoucherAnalyticsSchema
>;

