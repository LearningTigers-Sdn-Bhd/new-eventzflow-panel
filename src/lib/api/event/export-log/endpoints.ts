import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import {
	type CreateExportLogRequest,
	createExportLogSchema,
	type DownloadExportLogRequest,
	downloadExportLogSchema,
	type GetExportLogsRequest,
	getExportLogsSchema,
} from "./request";
import type { BackendExportLog, ExportLogs } from "./response";

/**
 * Transform backend export log to frontend format
 */
function transformExportLog(backendLog: BackendExportLog): ExportLogs {
	return {
		id: backendLog.id.toString(),
		type: backendLog.type as "ticket-list" | "scan_history",
		downloadUrl: `/v1/tickets/exports/${backendLog.id}`,
		createdAt: backendLog.created_at,
	};
}

/**
 * Get export logs for an event
 */
export async function getExportLogs(
	data: GetExportLogsRequest,
): Promise<ExportLogs[]> {
	try {
		const validated = getExportLogsSchema.parse(data);

		const response = await restClient.get<BackendExportLog[]>(
			`v1/tickets/exports?event_id=${validated.eventId}`,
		);

		return response.map(transformExportLog);
	} catch (error: unknown) {
		console.error("Error fetching export logs:", error);
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Create a new export log for an event
 */
export async function createExportLog(
	data: CreateExportLogRequest,
): Promise<ExportLogs> {
	try {
		const validated = createExportLogSchema.parse(data);

		const response = await restClient.post<{
			success: boolean;
			message: string;
			data: BackendExportLog;
		}>(`v1/tickets/exports?event_id=${validated.eventId}`, {});

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to create export");
		}

		return transformExportLog(response.data);
	} catch (error: unknown) {
		console.error("Error creating export log:", error);
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Download an export log file
 */
export async function downloadExportLog(
	data: DownloadExportLogRequest,
): Promise<void> {
	try {
		const validated = downloadExportLogSchema.parse(data);

		// Use restClient.getBlob() for authenticated file download
		const { blob, headers } = await restClient.getBlob(
			`v1/tickets/exports/${validated.exportId}`,
		);

		// Get filename from Content-Disposition header or create one
		const contentDisposition = headers.get("Content-Disposition");
		let filename = `export-${validated.exportId}.xlsx`;
		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
			if (filenameMatch) {
				filename = filenameMatch[1];
			}
		}

		// Create blob URL and trigger download
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	} catch (error: unknown) {
		console.error("Error downloading export log:", error);
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}
