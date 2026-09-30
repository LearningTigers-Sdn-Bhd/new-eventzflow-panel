import { kyClient, restClient } from "@/utils/rest-api";
import type {
	ManualExitRequest,
	UpdateRfidBindingRequest,
	UpdateRfidSettingsRequest,
	UpdateRfidStationRequest,
} from "./request";
import type {
	RfidAnomaliesResponse,
	RfidBindingResponse,
	RfidBindingsResponse,
	RfidSettingsResponse,
	RfidStationResponse,
	RfidStationsResponse,
	RfidSummary,
	RfidVisitResponse,
	RfidVisitsResponse,
} from "./response";

const base = (eventId: string | number) => `v1/events/${eventId}/rfid`;

/** Live headcount / open visits / anomaly count for the event. */
export function getRfidSummary(eventId: string | number): Promise<RfidSummary> {
	return restClient.get<RfidSummary>(`${base(eventId)}/summary`);
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
): Promise<RfidBindingsResponse> {
	return restClient.get<RfidBindingsResponse>(`${base(eventId)}/bindings`);
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

export function getRfidAnomalies(
	eventId: string | number,
	page = 1,
	perPage = 25,
): Promise<RfidAnomaliesResponse> {
	return restClient.get<RfidAnomaliesResponse>(
		`${base(eventId)}/anomalies?page=${page}&per_page=${perPage}`,
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
 * Download the visits CSV (UTF-8, formula-safe cells, open/manual markers).
 * Uses kyClient directly so we get the raw blob with the session cookie.
 */
export async function downloadRfidVisitsCsv(
	eventId: string | number,
): Promise<Blob> {
	const response = await kyClient.get(`${base(eventId)}/visits.csv`);
	return response.blob();
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
