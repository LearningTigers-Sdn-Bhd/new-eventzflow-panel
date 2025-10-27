import { z } from "zod";

// Validation schema for getting export logs
export const getExportLogsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Type exports for request data
export type GetExportLogsRequest = z.infer<typeof getExportLogsSchema>;
