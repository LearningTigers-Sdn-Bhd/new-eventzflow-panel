import { HTTPError, TimeoutError } from "ky";

// Statuses a proxy/load balancer returns while the backend is redeploying.
// 500 is deliberately excluded: that is a real application error, not an outage.
const UNAVAILABLE_STATUSES = new Set([408, 502, 503, 504]);

export function isUnavailableStatus(status: number): boolean {
	return UNAVAILABLE_STATUSES.has(status);
}

/**
 * True when a failed request means "backend unreachable / restarting" rather
 * than "the server answered and said no". Callers use this to avoid treating a
 * redeploy as a dead session (and logging the user out).
 */
export function isBackendUnavailable(error: unknown): boolean {
	if (error instanceof HTTPError) {
		return isUnavailableStatus(error.response.status);
	}
	if (error instanceof TimeoutError) return true;
	// fetch rejects with TypeError on network failure; a SyntaxError means a
	// proxy answered 2xx with a non-JSON body (e.g. an HTML maintenance page).
	return error instanceof TypeError || error instanceof SyntaxError;
}
