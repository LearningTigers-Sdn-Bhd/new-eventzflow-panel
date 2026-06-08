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
const CROSS_TAB_WAIT_MS = 3000; // Max time to wait for another tab's refresh

type RefreshMessage =
	| { type: "refresh_start" }
	| { type: "refresh_done" }
	| { type: "refresh_failed" };

class RefreshQueueService {
	private refreshPromise: Promise<string> | null = null;
	private channel: BroadcastChannel | null = null;
	private externalRefreshInProgress = false;

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
		if (!state.sessionCredentials) {
			return false;
		}
		return state.isTokenExpired() || state.isTokenExpiringSoon();
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

		await this.startRefresh();
		return true;
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
