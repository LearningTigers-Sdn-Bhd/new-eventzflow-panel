export const DEFAULT_AUTO_REFRESH_INTERVAL_MS = 5_000;

export function getAutoRefreshQueryOptions(
	intervalMs = DEFAULT_AUTO_REFRESH_INTERVAL_MS,
) {
	return {
		refetchInterval: intervalMs,
		refetchIntervalInBackground: false,
	} as const;
}
