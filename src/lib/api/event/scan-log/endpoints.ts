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
	ticket_type_name: string | null;
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
		ticketTypeName: row.ticket_type_name,
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
	if (v.ticketTypeId) query.set("ticket_type_id", String(v.ticketTypeId));

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
