import type { KyRequest } from "ky";
import { refreshToken } from "@/lib/api/auth";
import { useUserSessionStore } from "@/stores/new-auth-store";

/**
 * Proactive token refresh queue service
 *
 * Checks token expiration before requests are made.
 * When token is expired/expiring, queues requests and refreshes token once.
 * All queued requests are then executed with the new token.
 */
class RefreshQueueService {
	private refreshPromise: Promise<string> | null = null;

	// Endpoints that should not trigger token refresh
	private readonly excludedEndpoints = [
		"/auth/login",
		"/auth/register",
		"/auth/logout",
		"/auth/refresh_token",
		// Password reset flow (public endpoints)
		"/auth/password/request_reset_password",
		"/auth/password/verify_reset_password_request",
		"/auth/password/reset_password",
	];

	/**
	 * Check if endpoint should be excluded from token refresh logic
	 */
	private shouldExcludeEndpoint(url: string): boolean {
		return this.excludedEndpoints.some((endpoint) => url.includes(endpoint));
	}

	/**
	 * Check if token is expiring soon (within 5 minutes)
	 */
	private isTokenExpiringSoon(): boolean {
		return useUserSessionStore.getState().isTokenExpiringSoon();
	}

	/**
	 * Check if token is expired
	 */
	private isTokenExpired(): boolean {
		return useUserSessionStore.getState().isTokenExpired();
	}

	/**
	 * Check if we should refresh the token before making the request
	 */
	private shouldRefreshToken(): boolean {
		const state = useUserSessionStore.getState();

		// No credentials, nothing to refresh
		if (!state.sessionCredentials) {
			return false;
		}

		// Token is expired or expiring soon
		return this.isTokenExpired() || this.isTokenExpiringSoon();
	}

	/**
	 * Start the refresh process
	 */
	private async startRefresh(): Promise<string> {
		// If refresh is already in progress, return the existing promise
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		// Start new refresh
		this.refreshPromise = (async () => {
			try {
				// Call existing refreshToken function from endpoints.ts
				const newToken = await refreshToken();
				return newToken;
			} finally {
				// Clear the promise after completion (success or failure)
				this.refreshPromise = null;
			}
		})();

		return this.refreshPromise;
	}

	/**
	 * Wait for token refresh if needed before making request
	 *
	 * @param request - The request to potentially queue
	 * @returns true if token was refreshed, false if no refresh was needed
	 */
	async waitForRefreshIfNeeded(request: KyRequest): Promise<boolean> {
		// Skip excluded endpoints
		if (this.shouldExcludeEndpoint(request.url)) {
			return false;
		}

		// Skip if token is still valid
		if (!this.shouldRefreshToken()) {
			return false;
		}

		// Wait for refresh to complete (or start if not already in progress)
		await this.startRefresh();
		return true;
	}
}

// Export singleton instance
export const refreshQueueService = new RefreshQueueService();
