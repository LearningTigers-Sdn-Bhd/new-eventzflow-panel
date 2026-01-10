import { z } from "zod";

/**
 * Schema for getting voucher analytics for an event
 * GET /v1/events/:event_id/voucher_analytics
 * Optional vendor_id parameter to filter analytics for a specific vendor
 * Optional date range and grouping parameters for time series
 */
export const getVoucherAnalyticsSchema = z.object({
	event_id: z.number(),
	vendor_id: z.number().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	group_by: z.enum(["hour", "day", "week", "month"]).optional(),
});

export type GetVoucherAnalyticsRequest = z.infer<
	typeof getVoucherAnalyticsSchema
>;
