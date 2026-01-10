import { z } from "zod";

// Validation schema for getting event analytics
export const getEventAnalyticsSchema = z.object({
	id: z.number().int().positive(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	groupBy: z.enum(["hour", "day", "week", "month"]).optional(),
});

// Validation schema for time series request
export const getTimeSeriesSchema = z.object({
	eventId: z.number().int().positive(),
	metric: z.enum([
		"tickets",
		"scans",
		"revenue",
		"visitors",
		"stamps",
		"redemptions",
		"redemption_value",
	]),
	groupBy: z.enum(["hour", "day", "week", "month"]).optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

// Type exports for request data
export type GetEventAnalyticsRequest = z.infer<typeof getEventAnalyticsSchema>;
export type GetTimeSeriesRequest = z.infer<typeof getTimeSeriesSchema>;
export type TimeSeriesMetric = GetTimeSeriesRequest["metric"];
export type TimeSeriesGroupBy = NonNullable<GetTimeSeriesRequest["groupBy"]>;
