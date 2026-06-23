import type { KyRequest } from "ky";
import { refreshToken } from "@/lib/api/auth";
import { useUserSessionStore } from "@/stores/new-auth-store";

/**
 * Cross-tab token refresh coordination service.
 *
 * Uses BroadcastChannel (same-origin only) to ensure only ONE tab
 * performs the refresh at a time. Other tabs wait for the result
 * via localStorage (Zustand persist) update.
 *
 * Security: BroadcastChannel is restricted to same-origin by the browser.
 * No tokens or secrets are transmitted over the channel — only status signals.
 */

const REFRESH_CHANNEL_NAME = "eventzflow_token_refresh";
// Increased wait time - 5 seconds is more reliable for slow servers
const CROSS_TAB_WAIT_MS = 5000;
// Minimum time between refresh attempts (matches store constant)
const MIN_REFRESH_INTERVAL_MS = 30 * 1000;

type RefreshMessage =
	| { type: "refresh_start" }
	| { type: "refresh_done" }
	| { type: "refresh_failed" };

class RefreshQueueService {
	private refreshPromise: Promise<string> | null = null;
	private channel: BroadcastChannel | null = null;
	private externalRefreshInProgress = false;
	private lastRefreshAttempt = 0;

	// Endpoints that should not trigger token refresh
	private readonly excludedEndpoints = [
		"/auth/login",
		"/auth/register",
		"/auth/logout",
		"/auth/refresh_token",
		"/auth/password/request_reset_password",
		"/auth/password/verify_reset_password_request",
		"/auth/password/reset_password",
	];

	constructor() {
		this.initChannel();
	}

	/**
	 * Initialize BroadcastChannel for cross-tab coordination.
	 * Gracefully degrades if BroadcastChannel is unavailable.
	 */
	private initChannel(): void {
		if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
			return;
		}

		try {
			this.channel = new BroadcastChannel(REFRESH_CHANNEL_NAME);
			this.channel.onmessage = (event: MessageEvent<RefreshMessage>) => {
				const { type } = event.data;
				if (type === "refresh_start") {
					this.externalRefreshInProgress = true;
				} else if (type === "refresh_done" || type === "refresh_failed") {
					this.externalRefreshInProgress = false;
				}
			};
		} catch {
			// BroadcastChannel may fail in certain contexts (e.g., opaque origins)
			this.channel = null;
		}
	}

	private shouldExcludeEndpoint(url: string): boolean {
		return this.excludedEndpoints.some((endpoint) => url.includes(endpoint));
	}

	private shouldRefreshToken(): boolean {
		const state = useUserSessionStore.getState();

		// No credentials = not logged in, no need to refresh
		if (!state.sessionCredentials) {
			return false;
		}

		// Token is expired - needs refresh
		if (state.isTokenExpired()) {
			return true;
		}

		// Token is expiring soon (within 2 minutes) - needs proactive refresh
		if (state.isTokenExpiringSoon()) {
			return true;
		}

		return false;
	}

	private canAttemptRefresh(): boolean {
		const now = Date.now();
		// Rate limit: don't refresh more than once every 30 seconds
		if (now - this.lastRefreshAttempt < MIN_REFRESH_INTERVAL_MS) {
			return false;
		}
		this.lastRefreshAttempt = now;
		return true;
	}

	/**
	 * Notify other tabs that this tab is starting/finishing a refresh.
	 * Only status signals are sent — never tokens or credentials.
	 */
	private broadcast(message: RefreshMessage): void {
		try {
			this.channel?.postMessage(message);
		} catch {
			// Channel may be closed; ignore
		}
	}

	/**
	 * Wait for another tab's refresh to complete, then check
	 * if our token is now valid (via localStorage/Zustand sync).
	 */
	private async waitForExternalRefresh(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			const timeout = setTimeout(() => {
				resolve(false);
			}, CROSS_TAB_WAIT_MS);

			// Check every 200ms for external refresh completion
			const checkInterval = setInterval(() => {
				// If another tab finished and our token is now valid, we're good
				if (!this.externalRefreshInProgress || !this.shouldRefreshToken()) {
					clearTimeout(timeout);
					clearInterval(checkInterval);
					resolve(!this.shouldRefreshToken());
				}
			}, 200);
		});
	}

	/**
	 * Perform the actual token refresh with cross-tab coordination.
	 */
	private async startRefresh(): Promise<string> {
		// If this tab is already refreshing, deduplicate
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		// If another tab is refreshing, wait for it
		if (this.externalRefreshInProgress) {
			const resolved = await this.waitForExternalRefresh();
			if (resolved) {
				// Token is now valid from another tab's refresh
				const credentials =
					useUserSessionStore.getState().sessionCredentials;
				return credentials?.accessToken ?? "";
			}
			// External refresh failed or timed out — proceed with our own
		}

		this.refreshPromise = (async () => {
			try {
				this.broadcast({ type: "refresh_start" });
				const newToken = await refreshToken();
				this.broadcast({ type: "refresh_done" });
				return newToken;
			} catch (error) {
				this.broadcast({ type: "refresh_failed" });
				throw error;
			} finally {
				this.refreshPromise = null;
			}
		})();

		return this.refreshPromise;
	}

	/**
	 * Wait for token refresh if needed before making a request.
	 */
	async waitForRefreshIfNeeded(request: KyRequest): Promise<boolean> {
		if (this.shouldExcludeEndpoint(request.url)) {
			return false;
		}

		if (!this.shouldRefreshToken()) {
			return false;
		}

		// Check rate limiting
		if (!this.canAttemptRefresh()) {
			return false;
		}

		await this.startRefresh();
		return true;
	}

	/**
	 * Force a token refresh (for explicit refresh calls)
	 */
	async forceRefresh(): Promise<string> {
		if (!this.canAttemptRefresh()) {
			const credentials = useUserSessionStore.getState().sessionCredentials;
			if (credentials) {
				return credentials.accessToken;
			}
		}
		return this.startRefresh();
	}

	/**
	 * Clean up channel on teardown.
	 */
	destroy(): void {
		this.channel?.close();
		this.channel = null;
	}
}

// Export singleton instance
export const refreshQueueService = new RefreshQueueService();
