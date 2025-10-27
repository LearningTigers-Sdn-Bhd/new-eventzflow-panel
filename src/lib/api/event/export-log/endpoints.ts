import { type GetExportLogsRequest, getExportLogsSchema } from "./request";
import type { ExportLogs } from "./response";
import { mockExportLogs } from "./response";

/**
 * Get export logs for an event (mock data for now)
 */
export async function getExportLogs(
	data: GetExportLogsRequest,
): Promise<ExportLogs[]> {
	try {
		const validated = getExportLogsSchema.parse(data);
		const exportLogs = mockExportLogs[validated.eventId] || [];
		return exportLogs;
	} catch (error: unknown) {
		console.error("Error fetching export logs:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch export logs";
		throw new Error(errorMessage);
	}
}
