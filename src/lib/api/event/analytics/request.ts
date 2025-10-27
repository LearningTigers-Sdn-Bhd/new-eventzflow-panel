import { z } from "zod";

// Validation schema for getting event analytics
export const getEventAnalyticsSchema = z.object({
	id: z.number().int().positive(),
});

// Type exports for request data
export type GetEventAnalyticsRequest = z.infer<typeof getEventAnalyticsSchema>;
