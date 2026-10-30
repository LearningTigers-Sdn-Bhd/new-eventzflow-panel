import { publicRestClient, restClient } from "@/utils/rest-api";
import type { ConnectionInput, HallInput } from "./request";
import type {
	BackendHall,
	ConnectionTestResult,
	CounterConnection,
	CounterVenue,
	DailyBreakdown,
	Hall,
	HallStatus,
	Headcount,
	HeadcountFigures,
	HeadcountTrends,
	PublicDisplay,
	TrendBucket,
	TrendScope,
} from "./response";

const hallsPath = (eventId: string) => `v1/events/${eventId}/event_halls`;

function transformHall(hall: BackendHall): Hall {
	return {
		id: String(hall.id),
		name: hall.name,
		floor: hall.floor,
		counterVenueId: hall.counter_venue_id,
		position: hall.position,
	};
}

// Only send counter_venue_id when the caller set it: the API rejects any
// request that mentions it unless the user is an org owner.
function toBody({ name, floor, counterVenueId }: HallInput) {
	return {
		event_hall: {
			name,
			floor: floor || null,
			...(counterVenueId !== undefined && { counter_venue_id: counterVenueId }),
		},
	};
}

export async function getHalls(eventId: string): Promise<Hall[]> {
	const halls = await restClient.get<BackendHall[]>(hallsPath(eventId));
	return halls.map(transformHall);
}

export async function createHall(
	eventId: string,
	input: HallInput,
): Promise<Hall> {
	const hall = await restClient.post<BackendHall>(
		hallsPath(eventId),
		toBody(input),
	);
	return transformHall(hall);
}

export async function updateHall(
	eventId: string,
	hallId: string,
	input: HallInput,
): Promise<Hall> {
	const hall = await restClient.put<BackendHall>(
		`${hallsPath(eventId)}/${hallId}`,
		toBody(input),
	);
	return transformHall(hall);
}

export async function deleteHall(
	eventId: string,
	hallId: string,
): Promise<void> {
	await restClient.delete(`${hallsPath(eventId)}/${hallId}`);
}

interface BackendFigures {
	inside_now: number | null;
	capacity: number | null;
	in_today: number | null;
	out_today: number | null;
	in_event: number | null;
	out_event: number | null;
}

function transformFigures(f: BackendFigures): HeadcountFigures {
	return {
		insideNow: f.inside_now,
		capacity: f.capacity,
		inToday: f.in_today,
		outToday: f.out_today,
		inEvent: f.in_event,
		outEvent: f.out_event,
	};
}

interface BackendHeadcount {
	configured: boolean;
	event: BackendFigures & { halls: number; halls_counted: number };
	levels: (BackendFigures & {
		floor: string | null;
		halls: number;
		halls_counted: number;
	})[];
	halls: (BackendFigures & {
		id: number;
		name: string;
		floor: string | null;
		status: Headcount["halls"][number]["status"];
	})[];
	generated_at: string;
}

/** Live + event-wide people counts, rolled up by hall, level and event. */
export async function getHeadcount(eventId: string): Promise<Headcount> {
	const data = await restClient.get<BackendHeadcount>(
		`${hallsPath(eventId)}/headcount`,
	);
	return {
		configured: data.configured,
		event: {
			...transformFigures(data.event),
			halls: data.event.halls,
			hallsCounted: data.event.halls_counted,
		},
		levels: data.levels.map((l) => ({
			...transformFigures(l),
			floor: l.floor,
			halls: l.halls,
			hallsCounted: l.halls_counted,
		})),
		halls: data.halls.map((h) => ({
			...transformFigures(h),
			id: h.id,
			name: h.name,
			floor: h.floor,
			status: h.status,
		})),
		generatedAt: data.generated_at,
	};
}

interface BackendPoint {
	bucket: string;
	in: number;
	out: number;
	occupancy: number;
}

interface BackendTrendScope {
	points: BackendPoint[];
	stats: {
		peak: { occupancy: number; at: string };
		busiest_entry_hour: { in: number; at: string };
		recent_flow: { net: number; in: number; out: number; at: string } | null;
	} | null;
	before_in?: number;
	before_days?: { date: string; in: number }[];
}

interface BackendTrends {
	configured: boolean;
	date: string;
	days: string[];
	bucket: TrendBucket;
	event: BackendTrendScope;
	levels: (BackendTrendScope & { floor: string | null })[];
	halls: (BackendTrendScope & {
		id: number;
		name: string;
		floor: string | null;
		status: HallStatus;
	})[];
	generated_at: string;
}

function transformScope(scope: BackendTrendScope): TrendScope {
	const { stats } = scope;
	return {
		beforeIn: scope.before_in,
		beforeDays: scope.before_days?.map((d) => ({
			date: d.date,
			entries: d.in,
		})),
		points: scope.points.map((p) => ({
			time: p.bucket,
			entries: p.in,
			exits: p.out,
			occupancy: p.occupancy,
		})),
		stats: stats && {
			peak: stats.peak,
			busiestEntryHour: {
				entries: stats.busiest_entry_hour.in,
				at: stats.busiest_entry_hour.at,
			},
			recentFlow: stats.recent_flow && {
				net: stats.recent_flow.net,
				entries: stats.recent_flow.in,
				exits: stats.recent_flow.out,
				at: stats.recent_flow.at,
			},
		},
	};
}

export interface TrendsQuery {
	/** "YYYY-MM-DD"; the API falls back to today / the first event day. */
	date?: string;
	bucket?: TrendBucket;
	/** Also total the visitors from the event's earlier days (`beforeIn`), for "so far" figures. */
	cumulative?: boolean;
	/** Excel export only: write times as 2:15 PM instead of 14:15. */
	hour12?: boolean;
	/** Excel export only: the whole event instead of one day. */
	allDays?: boolean;
}

const trendsQueryString = ({
	date,
	bucket,
	cumulative,
	hour12,
	allDays,
}: TrendsQuery) => {
	const query = new URLSearchParams();
	if (date) query.set("date", date);
	if (bucket) query.set("bucket", String(bucket));
	if (cumulative) query.set("cumulative", "1");
	if (hour12) query.set("hour12", "1");
	if (allDays) query.set("all_days", "1");
	const text = query.toString();
	return text ? `?${text}` : "";
};

/** One day of counts over time, per hall, level and event, with peak stats. */
export async function getHeadcountTrends(
	eventId: string,
	query: TrendsQuery = {},
): Promise<HeadcountTrends> {
	const data = await restClient.get<BackendTrends>(
		`${hallsPath(eventId)}/analytics${trendsQueryString(query)}`,
	);
	return {
		configured: data.configured,
		date: data.date,
		days: data.days,
		bucket: data.bucket,
		event: transformScope(data.event),
		levels: data.levels.map((l) => ({ ...transformScope(l), floor: l.floor })),
		halls: data.halls.map((h) => ({
			...transformScope(h),
			id: h.id,
			name: h.name,
			floor: h.floor,
			status: h.status,
		})),
		generatedAt: data.generated_at,
	};
}

interface BackendDaily {
	configured: boolean;
	days: {
		date: string;
		entries: number;
		exits: number;
		peak: { occupancy: number; at: string } | null;
		busiest_entry_hour: { in: number; at: string } | null;
		closing: number | null;
		halls: {
			id: number;
			name: string;
			floor: string | null;
			status: HallStatus;
			entries: number;
			exits: number;
			peak: { occupancy: number; at: string } | null;
			closing: number | null;
		}[];
	}[];
}

/** Every event day up to today, event-wide: arrivals, departures and the peak crowd. */
export async function getDailyBreakdown(
	eventId: string,
): Promise<DailyBreakdown> {
	const data = await restClient.get<BackendDaily>(
		`${hallsPath(eventId)}/daily`,
	);
	return {
		configured: data.configured,
		days: data.days.map((d) => ({
			date: d.date,
			entries: d.entries,
			exits: d.exits,
			peak: d.peak,
			busiestEntryHour: d.busiest_entry_hour && {
				entries: d.busiest_entry_hour.in,
				at: d.busiest_entry_hour.at,
			},
			closing: d.closing,
			halls: d.halls.map((h) => ({
				id: h.id,
				name: h.name,
				floor: h.floor,
				status: h.status,
				entries: h.entries,
				exits: h.exits,
				peak: h.peak,
				closing: h.closing,
			})),
		})),
	};
}

/** The same day as a formatted Excel report (authenticated, so it can't be a plain link). */
export async function downloadHeadcountReport(
	eventId: string,
	query: TrendsQuery = {},
): Promise<Blob> {
	const { blob } = await restClient.getBlob(
		`${hallsPath(eventId)}/analytics_export${trendsQueryString(query)}`,
	);
	return blob;
}

interface BackendPublicDisplay {
	event_title: string;
	level: string | null;
	hall: string | null;
	configured: boolean;
	inside_now: number | null;
	capacity: number | null;
	halls_counted: number;
	halls_total: number;
	levels: {
		floor: string | null;
		inside_now: number | null;
		capacity: number | null;
	}[];
	halls: {
		name: string;
		floor: string | null;
		status: HallStatus;
		inside_now: number | null;
		capacity: number | null;
	}[];
	generated_at: string;
}

/** The public big-screen data for a published event, or for one of its levels or halls. No login. */
export async function getPublicDisplay(
	slug: string,
	level?: string | null,
	hall?: string | null,
): Promise<PublicDisplay> {
	const params = new URLSearchParams();
	if (level) params.set("level", level);
	if (hall) params.set("hall", hall);
	const query = params.size ? `?${params}` : "";
	const data = await publicRestClient.get<BackendPublicDisplay>(
		`v1/public/events/${encodeURIComponent(slug)}/people_counter${query}`,
	);
	return {
		eventTitle: data.event_title,
		level: data.level,
		hall: data.hall,
		configured: data.configured,
		insideNow: data.inside_now,
		capacity: data.capacity,
		hallsCounted: data.halls_counted,
		hallsTotal: data.halls_total,
		levels: data.levels.map((l) => ({
			floor: l.floor,
			insideNow: l.inside_now,
			capacity: l.capacity,
		})),
		halls: data.halls.map((h) => ({
			name: h.name,
			floor: h.floor,
			status: h.status,
			insideNow: h.inside_now,
			capacity: h.capacity,
		})),
		generatedAt: data.generated_at,
	};
}

/** Venues on the event's people-counter service. Org owners only. */
export async function getCounterVenues(
	eventId: string,
): Promise<CounterVenue[]> {
	return restClient.get<CounterVenue[]>(
		`v1/events/${eventId}/people_counter/venues`,
	);
}

const connectionPath = (eventId: string) =>
	`v1/events/${eventId}/people_counter_connection`;

interface BackendConnection {
	configured: boolean;
	source: CounterConnection["source"];
	base_url: string | null;
	key_prefix: string | null;
}

function transformConnection(c: BackendConnection): CounterConnection {
	return {
		configured: c.configured,
		source: c.source,
		baseUrl: c.base_url,
		keyPrefix: c.key_prefix,
	};
}

// The key is write-only: it goes to the server and only its prefix ever comes back.
function toConnectionBody({ baseUrl, apiKey }: ConnectionInput) {
	return {
		people_counter_connection: { base_url: baseUrl, api_key: apiKey },
	};
}

/** The event's counter connection (org owners only). */
export async function getConnection(
	eventId: string,
): Promise<CounterConnection> {
	return transformConnection(
		await restClient.get<BackendConnection>(connectionPath(eventId)),
	);
}

export async function saveConnection(
	eventId: string,
	input: ConnectionInput,
): Promise<CounterConnection> {
	return transformConnection(
		await restClient.put<BackendConnection>(
			connectionPath(eventId),
			toConnectionBody(input),
		),
	);
}

export async function deleteConnection(eventId: string): Promise<void> {
	await restClient.delete(connectionPath(eventId));
}

/** Tries a URL + key (or the saved ones when blank) without saving anything. */
export async function testConnection(
	eventId: string,
	input: ConnectionInput,
): Promise<ConnectionTestResult> {
	return restClient.post<ConnectionTestResult>(
		`${connectionPath(eventId)}/test`,
		toConnectionBody(input),
	);
}
