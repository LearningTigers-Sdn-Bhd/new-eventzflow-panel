// Staff RFID API response types — shapes fixed by the backend request specs
// (eventz-flow-backend spec/requests/v1/rfid_management_spec.rb at 4bf6550).
// These endpoints are JWT-only: API keys (including the RFID device key) are
// refused server-side, so this module only ever uses the panel's session.

export type RfidStationRole = "entry" | "exit";
export type RfidUidRule = "as_is" | "reversed";
export type RfidMode = "bind" | "write";

export type RfidSummary = {
	headcount: number;
	open_visits: number;
	anomaly_count: number;
	last_observed_at: string | null;
};

export type RfidStation = {
	id: number;
	station_key: string;
	name: string | null;
	kind: string;
	role: RfidStationRole | null;
	uid_rule: RfidUidRule;
	hw_model: string | null;
	firmware: string | null;
	app_version: string | null;
	last_heartbeat_at: string | null;
};

export type RfidBinding = {
	id: number;
	ticket_public_id: string | null;
	ticket_name: string | null;
	protocol: string;
	uid_raw_hex: string;
	tag_key: string;
	mode: RfidMode;
	active: boolean;
	captured_at: string | null;
	recorded_at: string | null;
	revoked_at: string | null;
	revocation_reason: string | null;
};

export type RfidVisit = {
	id: number;
	ticket_public_id: string | null;
	ticket_name: string | null;
	ticket_type: string | null;
	entry_at: string | null;
	exit_at: string | null;
	duration_seconds: number | null;
	status: "open" | "closed";
	manual: boolean;
	anomalies: string[];
	entry_station: string | null;
	exit_station: string | null;
};

// An anomaly row keeps both the reply the gate was first given and the
// current adjudication — a late offline binding or a staff correction can
// change the meaning of a reading without rewriting its raw record.
export type RfidAnomalyObservation = {
	observation_id: number;
	station_key: string | null;
	role: RfidStationRole | null;
	tag_key: string;
	ticket_public_id: string | null;
	ticket_name: string | null;
	captured_at: string | null;
	original_outcome: string | null;
	current_outcome: string;
	original_anomalies: string[];
	anomalies: string[];
	reason: string | null;
};

export type RfidSettings = {
	event_id: number;
	rfid_mode: RfidMode;
	require_check_in: boolean;
};

export type RfidPagination = {
	current_page: number;
	total_pages: number;
	total_count: number;
	per_page: number;
	prev_page: number | null;
	next_page: number | null;
};

export type RfidStationsResponse = { stations: RfidStation[] };
export type RfidStationResponse = { station: RfidStation };
export type RfidBindingsResponse = { bindings: RfidBinding[] };
export type RfidBindingResponse = { binding: RfidBinding };
export type RfidVisitsResponse = {
	visits: RfidVisit[];
	pagination: RfidPagination;
};
export type RfidVisitResponse = { visit: RfidVisit };
export type RfidAnomaliesResponse = {
	observations: RfidAnomalyObservation[];
	visits: RfidVisit[];
	pagination: RfidPagination;
};
export type RfidSettingsResponse = { settings: RfidSettings };
