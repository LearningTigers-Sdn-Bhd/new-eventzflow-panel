import { z } from "zod";

// Validation schema for getting export logs
export const getExportLogsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Validation schema for creating export log
export const createExportLogSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	from: z.string().optional(),
	to: z.string().optional(),
});

// Validation schema for downloading export log
export const downloadExportLogSchema = z.object({
	exportId: z.string().min(1, "Export ID is required"),
});

// Type exports for request data
export type GetExportLogsRequest = z.infer<typeof getExportLogsSchema>;
export type CreateExportLogRequest = z.infer<typeof createExportLogSchema>;
export type DownloadExportLogRequest = z.infer<typeof downloadExportLogSchema>;
