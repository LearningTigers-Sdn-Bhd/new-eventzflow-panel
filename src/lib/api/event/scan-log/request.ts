import { z } from "zod";

// Validation schema for getting scan logs
export const getScanLogsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Type exports for request data
export type GetScanLogsRequest = z.infer<typeof getScanLogsSchema>;
