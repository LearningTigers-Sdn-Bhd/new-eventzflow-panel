import { kyClient, restClient } from "@/utils/rest-api";
import type {
	ManualEntryRequest,
	ManualExitRequest,
	RfidSessionRequest,
	UpdateRfidBindingRequest,
	UpdateRfidSettingsRequest,
	UpdateRfidStationRequest,
} from "./request";
import type {
	RfidAnomaliesResponse,
	RfidAttendanceCheck,
	RfidAttendanceCheckReason,
	RfidAttendanceCheckResult,
	RfidBindingResponse,
	RfidBindingsResponse,
	RfidDisplayMode,
	RfidDisplayResponse,
	RfidEligibilityResponse,
	RfidEligibilityRow,
	RfidEligibilityStatus,
	RfidFlow,
	RfidGuestVisitsResponse,
	RfidMissedReason,
	RfidMissedScansResponse,
	RfidReportFieldsResponse,
	RfidSessionAttendeesResponse,
	RfidSessionResponse,
	RfidSessionsResponse,
	RfidSettingsResponse,
	RfidStationResponse,
	RfidStationsResponse,
	RfidSummary,
	RfidVisitResponse,
	RfidVisitsResponse,
} from "./response";

const base = (eventId: string | number) => `v1/events/${eventId}/rfid`;

export function getRfidDisplayActivity(
	eventId: string | number,
	mode: RfidDisplayMode,
): Promise<RfidDisplayResponse> {
	return restClient.get<RfidDisplayResponse>(
		`${base(eventId)}/display_activity?mode=${mode}`,
	);
}

/** Live headcount / open visits / anomaly count for the event. */
export function getRfidSummary(
	eventId: string | number,
	ticketTypeId?: string,
): Promise<RfidSummary> {
	const query = ticketTypeId
		? `?ticket_type_id=${encodeURIComponent(ticketTypeId)}`
		: "";
	return restClient.get<RfidSummary>(`${base(eventId)}/summary${query}`);
}

/** All stations that have heartbeated for this event. */
export function getRfidStations(
	eventId: string | number,
): Promise<RfidStationsResponse> {
	return restClient.get<RfidStationsResponse>(`${base(eventId)}/stations`);
}

/**
 * Confirmed role / UID-rule correction. Requires a reason and `confirm: true`;
 * when `observation_ids` names past readings, only those are re-measured —
 * raw records are never rewritten.
 */
export function updateRfidStation(
	eventId: string | number,
	stationId: number,
	data: UpdateRfidStationRequest,
): Promise<RfidStationResponse> {
	return restClient.patch<RfidStationResponse>(
		`${base(eventId)}/stations/${stationId}`,
		data,
	);
}

/** Active and revoked binding history (no contact details, never keys). */
export function getRfidBindings(
	eventId: string | number,
	page = 1,
	perPage = 25,
	filters: {
		status?: "active" | "revoked";
		q?: string;
		ticketTypeId?: string;
	} = {},
): Promise<RfidBindingsResponse> {
	const params = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	if (filters.status) params.set("status", filters.status);
	if (filters.q?.trim()) params.set("q", filters.q.trim());
	if (filters.ticketTypeId) params.set("ticket_type_id", filters.ticketTypeId);
	return restClient.get<RfidBindingsResponse>(
		`${base(eventId)}/bindings?${params.toString()}`,
	);
}

/** One row per guest, their in/out visits folded together. */
export function getRfidGuestVisits(
	eventId: string | number,
	page = 1,
	perPage = 25,
	filters: {
		status?: "inside" | "outside";
		q?: string;
		ticketTypeId?: string;
	} = {},
): Promise<RfidGuestVisitsResponse> {
	const params = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	if (filters.status) params.set("status", filters.status);
	if (filters.q?.trim()) params.set("q", filters.q.trim());
	if (filters.ticketTypeId) params.set("ticket_type_id", filters.ticketTypeId);
	return restClient.get<RfidGuestVisitsResponse>(
		`${base(eventId)}/guest_visits?${params.toString()}`,
	);
}

export function getRfidVisits(
	eventId: string | number,
	page = 1,
	perPage = 25,
): Promise<RfidVisitsResponse> {
	return restClient.get<RfidVisitsResponse>(
		`${base(eventId)}/visits?page=${page}&per_page=${perPage}`,
	);
}

/**
 * Close an open visit manually. Requires a reason and an RFC3339 time not
 * before the entry; records a correction row, never a synthetic gate read.
 */
export function manualExitRfidVisit(
	eventId: string | number,
	visitId: number,
	data: ManualExitRequest,
): Promise<RfidVisitResponse> {
	return restClient.post<RfidVisitResponse>(
		`${base(eventId)}/visits/${visitId}/manual_exit`,
		data,
	);
}

/**
 * Close every open visit at once (optionally one ticket type), e.g. when the
 * hall is empty but guests never tapped out. One correction per visit.
 */
export function manualExitAllRfidVisits(
	eventId: string | number,
	data: ManualExitRequest & { ticket_type_id?: string },
): Promise<{ closed: number }> {
	return restClient.post<{ closed: number }>(
		`${base(eventId)}/visits/manual_exit_all`,
		data,
	);
}

/** Take back the newest "mark all as exited" sweep. */
export function undoManualExitAllRfidVisits(
	eventId: string | number,
): Promise<{ reopened: number }> {
	return restClient.delete<{ reopened: number }>(
		`${base(eventId)}/visits/manual_exit_all`,
	);
}

/**
 * Waive the session attendance rule for one guest (e.g. left early for
 * logistics). Feedback is still required; recorded as an audited correction.
 */
export function grantRfidCertOverride(
	eventId: string | number,
	ticketId: number,
	data: { reason: string },
): Promise<{ ticket: RfidEligibilityRow }> {
	return restClient.post<{ ticket: RfidEligibilityRow }>(
		`${base(eventId)}/eligibility/${ticketId}/override`,
		data,
	);
}

export type RfidBulkOverrideResult = {
	count: number;
	dry_run: boolean;
	// Dry run only: the first `limit` guests that would be waived.
	guests?: {
		id: number;
		ticket_name: string;
		ticket_public_id: string;
		ticket_type: string | null;
		feedback_submitted: boolean;
		lowest_percent: number;
		sessions_attended: number;
		sessions_total: number;
	}[];
	limit?: number;
};

/** Registration-form fields (category, agency...) the bulk waive can filter by. */
export function getRfidEligibilityFields(
	eventId: string | number,
): Promise<{ fields: { key: string; values: string[] }[] }> {
	return restClient.get<{ fields: { key: string; values: string[] }[] }>(
		`${base(eventId)}/eligibility/fields`,
	);
}

/**
 * Waive the session rule for every guest matching the eligibility filters who
 * is still short (already-waived and already-met guests are skipped). With
 * `dry_run` it only reports how many guests that is.
 */
export function bulkRfidCertOverride(
	eventId: string | number,
	data: {
		reason?: string;
		dry_run?: boolean;
		status?: RfidEligibilityStatus;
		q?: string;
		ticket_type_id?: string;
		min_percent?: string;
		// Event days as groups of session ids; with `attended_mode` keeps guests
		// who came on any / every / only some of those days (any time inside).
		attended_days?: number[][];
		attended_mode?: "any" | "all" | "partial";
		custom_fields?: Record<string, string[]>;
	},
): Promise<RfidBulkOverrideResult> {
	return restClient.post<RfidBulkOverrideResult>(
		`${base(eventId)}/eligibility/bulk_override`,
		data,
	);
}

export function revokeRfidCertOverride(
	eventId: string | number,
	ticketId: number,
): Promise<{ ticket: RfidEligibilityRow }> {
	return restClient.delete<{ ticket: RfidEligibilityRow }>(
		`${base(eventId)}/eligibility/${ticketId}/override`,
	);
}

/**
 * Add a closed visit the gate never recorded (gate down, sticker unread).
 * A correction with actor and reason, never a synthetic gate read.
 */
export function manualEntryRfidVisit(
	eventId: string | number,
	data: ManualEntryRequest,
): Promise<RfidVisitResponse> {
	return restClient.post<RfidVisitResponse>(
		`${base(eventId)}/visits/manual_entry`,
		data,
	);
}

/** Guests the gates may have missed, per group, with how many can be messaged. */
export function getRfidAttendanceCheck(
	eventId: string | number,
	ticketTypeIds?: number[],
): Promise<RfidAttendanceCheck> {
	const params = new URLSearchParams();
	for (const id of ticketTypeIds ?? [])
		params.append("ticket_type_ids[]", String(id));
	const query = params.size ? `?${params.toString()}` : "";
	return restClient.get<RfidAttendanceCheck>(
		`${base(eventId)}/attendance_check${query}`,
	);
}

/**
 * Fire the event webhook once per reachable guest in the chosen groups, so
 * the receiver (SalesCatalyst) can reach them on WhatsApp.
 */
export function notifyRfidAttendanceCheck(
	eventId: string | number,
	reasons: RfidAttendanceCheckReason[],
	ticketTypeIds: number[],
): Promise<RfidAttendanceCheckResult> {
	return restClient.post<RfidAttendanceCheckResult>(
		`${base(eventId)}/attendance_check/notify`,
		{ reasons, ticket_type_ids: ticketTypeIds },
	);
}

export function getRfidAnomalies(
	eventId: string | number,
	page = 1,
	perPage = 25,
	filters: { q?: string; outcome?: string; station?: string } = {},
): Promise<RfidAnomaliesResponse> {
	const params = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	if (filters.q?.trim()) params.set("q", filters.q.trim());
	if (filters.outcome) params.set("outcome", filters.outcome);
	if (filters.station) params.set("station", filters.station);
	return restClient.get<RfidAnomaliesResponse>(
		`${base(eventId)}/anomalies?${params.toString()}`,
	);
}

/** Checked in at the desk but never read by a gate; optional reason filter. */
export function getRfidMissedScans(
	eventId: string | number,
	page = 1,
	perPage = 25,
	filters: {
		reason?: RfidMissedReason;
		q?: string;
		ticketTypeId?: string;
	} = {},
): Promise<RfidMissedScansResponse> {
	const params = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	if (filters.reason) params.set("reason", filters.reason);
	if (filters.q?.trim()) params.set("q", filters.q.trim());
	if (filters.ticketTypeId) params.set("ticket_type_id", filters.ticketTypeId);
	return restClient.get<RfidMissedScansResponse>(
		`${base(eventId)}/missed_scans?${params.toString()}`,
	);
}

/** Entries, exits and people inside per time bucket (for the live chart). */
export function getRfidFlow(
	eventId: string | number,
	range: { from?: string; to?: string } = {},
): Promise<RfidFlow> {
	const params = new URLSearchParams();
	if (range.from) params.set("from", range.from);
	if (range.to) params.set("to", range.to);
	const query = params.toString();
	return restClient.get<RfidFlow>(
		`${base(eventId)}/flow${query ? `?${query}` : ""}`,
	);
}

/** Sessions with their attendance counts and the e-cert eligibility totals. */
export function getRfidSessions(
	eventId: string | number,
): Promise<RfidSessionsResponse> {
	return restClient.get<RfidSessionsResponse>(`${base(eventId)}/sessions`);
}

/** Who was inside during one session, one row per guest. */
export function getRfidSessionAttendees(
	eventId: string | number,
	sessionId: number,
	page = 1,
	perPage = 25,
	filters: {
		status?: "attended" | "partial";
		q?: string;
		ticketTypeId?: string;
	} = {},
): Promise<RfidSessionAttendeesResponse> {
	const params = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	if (filters.status) params.set("status", filters.status);
	if (filters.q?.trim()) params.set("q", filters.q.trim());
	if (filters.ticketTypeId) params.set("ticket_type_id", filters.ticketTypeId);
	return restClient.get<RfidSessionAttendeesResponse>(
		`${base(eventId)}/sessions/${sessionId}/attendees?${params.toString()}`,
	);
}

export function createRfidSession(
	eventId: string | number,
	data: RfidSessionRequest,
): Promise<RfidSessionResponse> {
	return restClient.post<RfidSessionResponse>(
		`${base(eventId)}/sessions`,
		data,
	);
}

export function updateRfidSession(
	eventId: string | number,
	sessionId: number,
	data: RfidSessionRequest,
): Promise<RfidSessionResponse> {
	return restClient.patch<RfidSessionResponse>(
		`${base(eventId)}/sessions/${sessionId}`,
		data,
	);
}

export function deleteRfidSession(
	eventId: string | number,
	sessionId: number,
): Promise<{ deleted: true }> {
	return restClient.delete<{ deleted: true }>(
		`${base(eventId)}/sessions/${sessionId}`,
	);
}

/** E-certificate eligibility per guest, optionally filtered by status. */
export function getRfidEligibility(
	eventId: string | number,
	page = 1,
	perPage = 25,
	filters: {
		status?: RfidEligibilityStatus;
		q?: string;
		ticketTypeId?: string;
	} = {},
): Promise<RfidEligibilityResponse> {
	const params = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	if (filters.status) params.set("status", filters.status);
	if (filters.q?.trim()) params.set("q", filters.q.trim());
	if (filters.ticketTypeId) params.set("ticket_type_id", filters.ticketTypeId);
	return restClient.get<RfidEligibilityResponse>(
		`${base(eventId)}/eligibility?${params.toString()}`,
	);
}

/**
 * Update the event's RFID mode / check-in requirement. `write` tells RfiDex
 * desks to encode stickers; RfiDex still refuses to write until the reader's
 * sticker write test has passed on that PC.
 */
export function updateRfidSettings(
	eventId: string | number,
	data: UpdateRfidSettingsRequest,
): Promise<RfidSettingsResponse> {
	return restClient.patch<RfidSettingsResponse>(
		`${base(eventId)}/settings`,
		data,
	);
}

/**
 * Download the attendance report workbook (.xlsx: summary, session
 * attendance, no-gate-read, visits and more).
 * Uses kyClient directly so we get the raw blob with the session cookie.
 */
export async function downloadRfidReportXlsx(
	eventId: string | number,
	fields: string[] = [],
): Promise<Blob> {
	const query = fields
		.map((f) => `fields[]=${encodeURIComponent(f)}`)
		.join("&");
	const response = await kyClient.get(
		`${base(eventId)}/report.xlsx${query ? `?${query}` : ""}`,
	);
	return response.blob();
}

/** Custom fields staff can add as extra columns to the Excel report. */
export function getRfidReportFields(
	eventId: string | number,
): Promise<RfidReportFieldsResponse> {
	return restClient.get<RfidReportFieldsResponse>(
		`${base(eventId)}/report_fields`,
	);
}

// --- Org-owner clean-up (backend: EventPolicy#rfid_admin?) -----------------

/** Delete a station together with its readings and derived visits. */
export function deleteRfidStation(
	eventId: string | number,
	stationId: number,
): Promise<{ deleted: true }> {
	return restClient.delete<{ deleted: true }>(
		`${base(eventId)}/stations/${stationId}`,
	);
}

/** Change an active binding's ticket and/or sticker (tag key) in place. */
export function updateRfidBinding(
	eventId: string | number,
	bindingId: number,
	data: UpdateRfidBindingRequest,
): Promise<RfidBindingResponse> {
	return restClient.patch<RfidBindingResponse>(
		`${base(eventId)}/bindings/${bindingId}`,
		data,
	);
}

/** Hard delete; earlier readings of that sticker become unknown. */
export function deleteRfidBinding(
	eventId: string | number,
	bindingId: number,
): Promise<{ deleted: true }> {
	return restClient.delete<{ deleted: true }>(
		`${base(eventId)}/bindings/${bindingId}`,
	);
}

/** Hard delete one visit and its readings; the station and sticker stay. */
export function deleteRfidVisit(
	eventId: string | number,
	visitId: number,
): Promise<{ deleted: true }> {
	return restClient.delete<{ deleted: true }>(
		`${base(eventId)}/visits/${visitId}`,
	);
}

/** Hard delete every visit of one guest; returns how many went. */
export function deleteRfidGuestVisits(
	eventId: string | number,
	ticketId: number,
): Promise<{ deleted: number }> {
	return restClient.delete<{ deleted: number }>(
		`${base(eventId)}/guest_visits/${ticketId}`,
	);
}

/** Selection: `ids` of anomalous readings, or `all: true` for every one. */
export type RfidAnomalySelection = { ids: number[] } | { all: true };

/** Hide readings from Anomalies (list and count); the raw data stays. */
export function dismissRfidAnomalies(
	eventId: string | number,
	selection: RfidAnomalySelection,
): Promise<{ affected: number }> {
	return restClient.post<{ affected: number }>(
		`${base(eventId)}/anomalies/dismiss`,
		selection,
	);
}

/** Hard-delete readings (and the visits built from them). */
export function deleteRfidAnomalies(
	eventId: string | number,
	selection: RfidAnomalySelection,
): Promise<{ affected: number }> {
	return restClient.delete<{ affected: number }>(
		`${base(eventId)}/anomalies`,
		selection,
	);
}
