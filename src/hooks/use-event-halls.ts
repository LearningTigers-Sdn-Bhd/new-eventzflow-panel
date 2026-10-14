"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/use-auth";
import {
	getConnection,
	getCounterVenues,
	getDailyBreakdown,
	getHalls,
	getHeadcount,
	getHeadcountTrends,
	getPublicDisplay,
	type TrendBucket,
} from "@/lib/api/event/hall";

/** How often the live counts refresh. The API caches for 15 s, so faster is pointless. */
export const HEADCOUNT_REFRESH_MS = 15_000;

export const hallKeys = {
	halls: (eventId: string) => ["event", eventId, "halls"] as const,
	headcount: (eventId: string) => ["event", eventId, "headcount"] as const,
	trends: (eventId: string, date: string | undefined, bucket: TrendBucket) =>
		["event", eventId, "headcount-trends", date ?? "auto", bucket] as const,
	daily: (eventId: string) => ["event", eventId, "headcount-daily"] as const,
	counterVenues: (eventId: string) =>
		["event", eventId, "counter-venues"] as const,
	connection: (eventId: string) => ["event", eventId, "connection"] as const,
};

export function useHalls(eventId: string) {
	const { isInitialized } = useAuth();
	return useQuery({
		queryKey: hallKeys.halls(eventId),
		queryFn: () => getHalls(eventId),
		enabled: isInitialized,
	});
}

export function useHeadcount(eventId: string) {
	const { isInitialized } = useAuth();
	return useQuery({
		queryKey: hallKeys.headcount(eventId),
		queryFn: () => getHeadcount(eventId),
		enabled: isInitialized,
		refetchInterval: HEADCOUNT_REFRESH_MS,
	});
}

/** One day of counts over time. `date` unset = let the API pick (today, else the first event day). */
export function useHeadcountTrends(
	eventId: string,
	date: string | undefined,
	bucket: TrendBucket,
) {
	const { isInitialized } = useAuth();
	return useQuery({
		queryKey: hallKeys.trends(eventId, date, bucket),
		queryFn: () => getHeadcountTrends(eventId, { date, bucket }),
		enabled: isInitialized,
		refetchInterval: 2 * HEADCOUNT_REFRESH_MS,
		// Keep the old chart on screen while another day or bucket loads.
		placeholderData: keepPreviousData,
	});
}

/** Every event day up to today, event-wide. Past days barely change, so it refreshes slowly. */
export function useDailyBreakdown(eventId: string) {
	const { isInitialized } = useAuth();
	return useQuery({
		queryKey: hallKeys.daily(eventId),
		queryFn: () => getDailyBreakdown(eventId),
		enabled: isInitialized,
		refetchInterval: 4 * HEADCOUNT_REFRESH_MS,
	});
}

/** How often the big screen refreshes. The API caches for 15 s, so there is little point going faster. */
export const DISPLAY_REFRESH_MS = 10_000;

/** The public big-screen data for a published event. Needs no login; keeps the last numbers on screen if a refresh fails. */
export function usePublicDisplay(
	slug: string,
	level?: string | null,
	hall?: string | null,
) {
	return useQuery({
		queryKey: [
			"public-people-counter-display",
			slug,
			level ?? null,
			hall ?? null,
		] as const,
		queryFn: () => getPublicDisplay(slug, level, hall),
		refetchInterval: DISPLAY_REFRESH_MS,
		retry: false,
	});
}

/** Counter venues for the link dropdown (org owners only; the API refuses anyone else). */
export function useCounterVenues(eventId: string, enabled = true) {
	const { isInitialized } = useAuth();
	return useQuery({
		queryKey: hallKeys.counterVenues(eventId),
		queryFn: () => getCounterVenues(eventId),
		enabled: isInitialized && enabled,
		staleTime: 60_000,
		retry: false,
	});
}

/** The event's counter connection (org owners only). Pass `enabled: false` for everyone else. */
export function useConnection(eventId: string, enabled: boolean) {
	const { isInitialized } = useAuth();
	return useQuery({
		queryKey: hallKeys.connection(eventId),
		queryFn: () => getConnection(eventId),
		enabled: isInitialized && enabled,
	});
}
