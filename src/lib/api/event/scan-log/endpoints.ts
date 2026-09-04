import { restClient } from "@/utils/rest-api";
import { type GetScanLogsRequest, getScanLogsSchema } from "./request";
import type { Pagination, ScannedLog, ScanSource } from "./response";

type ApiScanLog = {
	id: number;
	scanned_at: string;
	source: ScanSource;
	scannable_type: "Ticket" | "Visitor";
	scannable_id: number;
	public_id: string | null;
	name: string | null;
	email: string | null;
	phone: string | null;
	location_name: string | null;
	scanned_by_name: string | null;
};

const SOURCE_FALLBACK: Record<ScanSource, string> = {
	staff_scan: "Staff scan",
	self_check_in: "Self check-in",
	kiosk: "Public Check-in Page",
};

function toScannedLog(row: ApiScanLog): ScannedLog {
	return {
		id: row.id,
		name: row.name ?? "Unknown",
		email: row.email,
		phone: row.phone,
		locationName: row.location_name ?? "—",
		// An unauthenticated scan has no scanner, so name the mechanism instead.
		scannedBy: row.scanned_by_name ?? SOURCE_FALLBACK[row.source],
		source: row.source,
		scannedAt: row.scanned_at,
		scannableType: row.scannable_type,
		scannableId: row.scannable_id,
		publicId: row.public_id,
	};
}

export async function getScanLogs(data: GetScanLogsRequest): Promise<{
	data: ScannedLog[];
	pagination: Pagination;
}> {
	const v = getScanLogsSchema.parse(data);

	const query = new URLSearchParams();
	if (v.page) query.set("page", String(v.page));
	if (v.perPage) query.set("per_page", String(v.perPage));
	if (v.q) query.set("q", v.q);
	if (v.source) query.set("source", v.source);
	if (v.eventLocationId)
		query.set("event_location_id", String(v.eventLocationId));
	if (v.date) query.set("date", v.date);
	if (v.scannableType) query.set("scannable_type", v.scannableType);
	if (v.scannableId) query.set("scannable_id", String(v.scannableId));

	const qs = query.toString();
	const response = await restClient.get<{
		data?: ApiScanLog[];
		pagination: Pagination;
	}>(`v1/events/${v.eventId}/scan_logs${qs ? `?${qs}` : ""}`);

	return {
		data: (response.data ?? []).map(toScannedLog),
		pagination: response.pagination,
	};
}

export type ScanLogExportFormat = "xlsx" | "csv" | "pdf";

export interface ExportScanLogsRequest {
	eventId: string | number;
	format: ScanLogExportFormat;
	q?: string;
	source?: ScanSource;
}

async function downloadScanLogExport({
	eventId,
	format,
	q,
	source,
}: ExportScanLogsRequest): Promise<void> {
	const query = new URLSearchParams({ format });
	if (q) query.set("q", q);
	if (source) query.set("source", source);

	const { blob, headers } = await restClient.getBlob(
		`v1/events/${eventId}/scan_logs/export?${query.toString()}`,
	);

	const fallbackFilename = `scan-logs-${eventId}.${format}`;
	let filename = fallbackFilename;
	const contentDisposition = headers.get("Content-Disposition");
	if (contentDisposition) {
		// Prefer the quoted filename="..." segment; Rails also appends an
		// RFC 5987 filename*=UTF-8''... segment which a greedy match would swallow.
		const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
		if (filenameMatch) {
			filename = filenameMatch[1];
		}
	}

	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
}

/**
 * Download the event's scan logs in the requested format (Excel, CSV or PDF).
 * Passes the active search/source filters through so the export matches what the
 * user currently sees in the table.
 */
export async function exportScanLogs(
	data: ExportScanLogsRequest,
): Promise<void> {
	return downloadScanLogExport(data);
}
