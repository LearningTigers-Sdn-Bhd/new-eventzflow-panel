// Staff RFID API response types — shapes fixed by the backend request specs
// (eventz-flow-backend spec/requests/v1/rfid_management_spec.rb at 4bf6550).
// These endpoints are JWT-only: API keys (including the RFID device key) are
// refused server-side, so this module only ever uses the panel's session.

export type RfidStationRole = "entry" | "exit";
export type RfidUidRule = "as_is" | "reversed";
export type RfidMode = "bind" | "write";

export type RfidMissedReason = "no_tag" | "no_read";

export type RfidSummary = {
	headcount: number;
	open_visits: number;
	anomaly_count: number;
	last_observed_at: string | null;
	// Paid, non-cancelled tickets only.
	registered: number;
	checked_in: number;
	not_arrived: number;
	gate_scanned: number;
	inside: number;
	outside: number;
	// Checked in at the desk but never read by a gate.
	missed_scans: Record<RfidMissedReason, number>;
	// For the ticket-type filter on the dashboard.
	ticket_types: { id: number; name: string }[];
};

export type RfidMissedScan = {
	id: number;
	ticket_public_id: string;
	ticket_name: string;
	ticket_type: string | null;
	checked_in_at: string | null;
	reason: RfidMissedReason;
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
	ticket_type: string | null;
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

export type RfidDisplayMode = "in" | "out" | "both";
export type RfidDisplayActivity = {
	id: string;
	ticket_name: string | null;
	direction: "in" | "out";
	occurred_at: string;
};
export type RfidDisplayResponse = { activity: RfidDisplayActivity[] };

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
	// Share of a session a guest must be inside to count as attended.
	attendance_percent: number;
};

export type RfidSessionStatus = "upcoming" | "live" | "ended";

export type RfidSession = {
	id: number;
	name: string;
	mandatory: boolean;
	starts_at: string;
	ends_at: string;
	duration_seconds: number;
	status: RfidSessionStatus;
	// Anyone inside at any moment of the session.
	present: number;
	// Inside for at least attendance_percent of the session.
	attended: number;
	required_seconds: number;
};

export type RfidEligibilityStatus =
	| "qualified"
	| "needs_feedback"
	| "in_progress"
	| "not_qualified";

export type RfidEligibilitySummary = Record<RfidEligibilityStatus, number> & {
	required_sessions: number;
};

export type RfidEligibilityRow = {
	id: number;
	ticket_public_id: string;
	ticket_name: string;
	ticket_type: string | null;
	ticket_type_id: number | null;
	feedback_submitted: boolean;
	// Staff waived the session attendance rule for this guest.
	override: { reason: string; at: string } | null;
	status: RfidEligibilityStatus;
	sessions: { session_id: number; percent: number; met: boolean }[];
};

export type RfidAttendanceCheckReason =
	| "never_detected"
	| "outside_during_session";

export type RfidAttendanceCheckGroup = {
	total: number;
	// Has a phone number and was not messaged in the last hour.
	sendable: number;
	no_phone: number;
	// No sticker bound, so no gate could have detected them.
	no_sticker: number;
	recently_notified: number;
};

export type RfidAttendanceCheck = {
	webhook_configured: boolean;
	ticket_types: { id: number; name: string }[];
	live_session: { id: number; name: string; ends_at: string } | null;
	groups: Record<RfidAttendanceCheckReason, RfidAttendanceCheckGroup>;
};

export type RfidAttendanceCheckResult = {
	sent: number;
	skipped_no_phone: number;
	skipped_recent: number;
};

// All of one guest's gate visits folded together; `visits` is newest first.
export type RfidGuestVisits = {
	ticket_id: number;
	ticket_public_id: string | null;
	ticket_name: string | null;
	ticket_type: string | null;
	visit_count: number;
	first_in: string | null;
	last_out: string | null;
	total_seconds: number;
	status: "inside" | "outside";
	manual: boolean;
	anomalies: string[];
	visits: RfidVisit[];
};

export type RfidGuestVisitsResponse = {
	guests: RfidGuestVisits[];
	ticket_types: { id: number; name: string }[];
	pagination: RfidPagination;
};

export type RfidAttendeeSegment = {
	in: string;
	out: string;
	seconds: number;
	open: boolean;
};

// One guest per row: several in/out visits are added up, never listed as
// separate attendees.
export type RfidSessionAttendee = {
	id: number;
	ticket_public_id: string;
	ticket_name: string;
	ticket_type: string | null;
	ticket_type_id: number | null;
	seconds: number;
	percent: number;
	attended: boolean;
	visit_count: number;
	first_in: string;
	last_out: string;
	still_inside: boolean;
	segments: RfidAttendeeSegment[];
};

export type RfidSessionAttendeesResponse = {
	session: RfidSession;
	counts: { attended: number; partial: number };
	ticket_types: { id: number; name: string }[];
	attendees: RfidSessionAttendee[];
	pagination: RfidPagination;
};

export type RfidFlowBucket = {
	at: string;
	entries: number;
	exits: number;
	inside: number;
};

export type RfidFlow = { interval_minutes: number; buckets: RfidFlowBucket[] };

export type RfidSessionsResponse = {
	sessions: RfidSession[];
	attendance_percent: number;
	eligibility: RfidEligibilitySummary;
};
export type RfidSessionResponse = { session: RfidSession };
export type RfidEligibilityResponse = {
	tickets: RfidEligibilityRow[];
	ticket_types: { id: number; name: string }[];
	sessions: RfidSession[];
	pagination: RfidPagination;
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
export type RfidBindingsResponse = {
	bindings: RfidBinding[];
	ticket_types: { id: number; name: string }[];
	pagination: RfidPagination;
};
export type RfidBindingResponse = { binding: RfidBinding };
export type RfidVisitsResponse = {
	visits: RfidVisit[];
	pagination: RfidPagination;
};
export type RfidVisitResponse = { visit: RfidVisit };
export type RfidAnomaliesResponse = {
	stations: string[];
	observations: RfidAnomalyObservation[];
	visits: RfidVisit[];
	pagination: RfidPagination;
};
export type RfidMissedScansResponse = {
	tickets: RfidMissedScan[];
	ticket_types: { id: number; name: string }[];
	pagination: RfidPagination;
};
export type RfidSettingsResponse = { settings: RfidSettings };
