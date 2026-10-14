// Raw shape from the Rails API
export interface BackendHall {
	id: number;
	event_id: number;
	name: string;
	floor: string | null;
	counter_venue_id: number | null;
	position: number;
}

export interface Hall {
	id: string;
	name: string;
	floor: string | null;
	counterVenueId: number | null;
	position: number;
}

export type HallStatus = "ok" | "unlinked" | "not_found" | "unavailable";

/** null = no figure available (unlinked hall, counter unreachable, no event dates). */
export interface HeadcountFigures {
	insideNow: number | null;
	capacity: number | null;
	inToday: number | null;
	outToday: number | null;
	inEvent: number | null;
	outEvent: number | null;
}

export interface HeadcountHall extends HeadcountFigures {
	id: number;
	name: string;
	floor: string | null;
	status: HallStatus;
}

export interface HeadcountRollup extends HeadcountFigures {
	halls: number;
	hallsCounted: number;
}

export interface HeadcountLevel extends HeadcountRollup {
	floor: string | null;
}

export interface Headcount {
	/** False when the event has no counter connection (and none is set server-wide). */
	configured: boolean;
	event: HeadcountRollup;
	levels: HeadcountLevel[];
	halls: HeadcountHall[];
	generatedAt: string;
}

/** One time slot of a day. `time` is the counter's local clock, "2026-09-11T14:15:00". */
export interface TrendPoint {
	time: string;
	entries: number;
	exits: number;
	/** People inside at the end of the slot. */
	occupancy: number;
}

export interface TrendStats {
	peak: { occupancy: number; at: string };
	busiestEntryHour: { entries: number; at: string };
	/** The latest 15 minutes with any movement; null when nothing moved. */
	recentFlow: {
		net: number;
		entries: number;
		exits: number;
		at: string;
	} | null;
}

export interface TrendScope {
	points: TrendPoint[];
	/** Null when the scope has no counted data (unlinked / unreachable / no activity). */
	stats: TrendStats | null;
}

export interface TrendHall extends TrendScope {
	id: number;
	name: string;
	floor: string | null;
	status: HallStatus;
}

export interface TrendLevel extends TrendScope {
	floor: string | null;
}

/** Minutes per slot. */
export type TrendBucket = 15 | 60;

export interface HeadcountTrends {
	configured: boolean;
	/** The day shown, "YYYY-MM-DD". */
	date: string;
	/** Every day of the event, for the day picker. */
	days: string[];
	bucket: TrendBucket;
	event: TrendScope;
	levels: TrendLevel[];
	halls: TrendHall[];
	generatedAt: string;
}

/** What the public big-screen page shows: crowd against capacity, nothing else. */
export interface PublicDisplay {
	eventTitle: string;
	/** The level this screen is narrowed to; null for the whole event. */
	level: string | null;
	/** The hall this screen is narrowed to; null unless it is a single-hall screen. */
	hall: string | null;
	configured: boolean;
	insideNow: number | null;
	capacity: number | null;
	/** Halls whose counter is working, out of all halls in scope. A level total only adds up counted halls. */
	hallsCounted: number;
	hallsTotal: number;
	levels: {
		floor: string | null;
		insideNow: number | null;
		capacity: number | null;
	}[];
	halls: {
		name: string;
		floor: string | null;
		status: HallStatus;
		insideNow: number | null;
		capacity: number | null;
	}[];
	generatedAt: string;
}

/** One event day, event-wide. Peaks are null when nothing was counted that day. */
export interface DaySummary {
	/** "YYYY-MM-DD". */
	date: string;
	entries: number;
	exits: number;
	peak: { occupancy: number; at: string } | null;
	busiestEntryHour: { entries: number; at: string } | null;
	/** People inside at the day's last reading. */
	closing: number | null;
}

export interface DailyBreakdown {
	configured: boolean;
	/** Every event day up to today. Days still to come are left out. */
	days: DaySummary[];
}

/** An event's link to the counter service. The key itself is never returned, only its prefix. */
export interface CounterConnection {
	configured: boolean;
	/** "event" = set here, "environment" = server-wide default, null = nothing. */
	source: "event" | "environment" | null;
	baseUrl: string | null;
	keyPrefix: string | null;
}

export interface ConnectionTestResult {
	ok: boolean;
	/** Number of counters found when ok. */
	venues?: number;
	reason?: "unauthorized" | "unreachable";
	message?: string;
}

export interface CounterVenue {
	id: number;
	name: string;
	capacity: number | null;
}
