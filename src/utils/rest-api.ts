import { QueryCache, QueryClient } from "@tanstack/react-query";
import ky from "ky";
import { toast } from "sonner";
import { refreshQueueService } from "@/services/refresh-queue";
import { useUserSessionStore } from "@/stores/new-auth-store";

// Conditional logger utility
const logger = {
	debug: (...args: unknown[]) => {
		if (process.env.NODE_ENV === "development") {
			console.log(...args);
		}
	},
	info: (...args: unknown[]) => {
		if (process.env.NODE_ENV === "development") {
			console.info(...args);
		}
	},
	warn: (...args: unknown[]) => {
		if (process.env.NODE_ENV === "development") {
			console.warn(...args);
		}
	},
	error: (...args: unknown[]) => {
		if (process.env.NODE_ENV === "development") {
			console.error(...args);
		}
	},
};

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error: Error) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

export const kyClient = ky.create({
	prefixUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
	retry: {
		limit: 3,
		methods: ["get", "post", "put", "delete", "patch"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
	hooks: {
		beforeRequest: [
			async (request) => {
				// Check if we need to wait for token refresh before this request
				try {
					await refreshQueueService.waitForRefreshIfNeeded(request);
				} catch (error) {
					console.error("Token refresh failed in beforeRequest:", error);
					// Let the request proceed anyway, it may still work or fail with 401
				}

				// Attach token if not already present
				if (!request.headers.has("Authorization")) {
					const isHydrated = useUserSessionStore.persist.hasHydrated();
					if (!isHydrated) {
						logger.debug("⚠️ Store not hydrated yet, waiting...");
						return;
					}

					const credentials = useUserSessionStore.getState().sessionCredentials;
					if (credentials?.accessToken) {
						request.headers.set(
							"Authorization",
							`Bearer ${credentials.accessToken}`,
						);
						logger.debug("✅ Token attached to request:", {
							url: request.url,
							tokenPreview: `${credentials.accessToken.substring(0, 20)}...`,
						});
					} else {
						logger.debug("⚠️ No access token available");
					}
				}
			},
		],
	},
});

/**
 * REST API client with standard HTTP methods
 * Provides convenience methods for making authenticated HTTP requests
 */
export const restClient = {
	/**
	 * Make a GET request
	 * @param url - The endpoint URL
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to the response data
	 */
	get: <T>(url: string, token?: string): Promise<T> => {
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		logger.debug("🔍 HTTP Client Debug (GET):");
		logger.debug("  - URL:", url);
		logger.debug("  - Token:", token);
		logger.debug("  - Headers:", headers);
		return kyClient.get(url, { headers }).json<T>();
	},

	/**
	 * Make a POST request
	 * @param url - The endpoint URL
	 * @param data - Optional request body data
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to the response data
	 */
	post: <T>(url: string, data?: unknown, token?: string): Promise<T> => {
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		logger.debug("🔍 HTTP Client Debug (POST):");
		logger.debug("  - URL:", url);
		logger.debug("  - Token:", token);
		logger.debug("  - Headers:", headers);
		logger.debug("  - Data:", data);
		return kyClient.post(url, { json: data, headers }).json<T>();
	},

	/**
	 * Make a PUT request
	 * @param url - The endpoint URL
	 * @param data - Optional request body data
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to the response data
	 */
	put: <T>(url: string, data?: unknown, token?: string): Promise<T> => {
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		logger.debug("🔍 HTTP Client Debug (PUT):");
		logger.debug("  - URL:", url);
		logger.debug("  - Token:", token);
		logger.debug("  - Headers:", headers);
		logger.debug("  - Data:", data);
		return kyClient.put(url, { json: data, headers }).json<T>();
	},

	/**
	 * Make a PATCH request
	 * @param url - The endpoint URL
	 * @param data - Optional request body data
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to the response data
	 */
	patch: <T>(url: string, data?: unknown, token?: string): Promise<T> => {
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		logger.debug("🔍 HTTP Client Debug (PATCH):");
		logger.debug("  - URL:", url);
		logger.debug("  - Token:", token);
		logger.debug("  - Headers:", headers);
		logger.debug("  - Data:", data);
		return kyClient.patch(url, { json: data, headers }).json<T>();
	},

	/**
	 * Make a DELETE request
	 * @param url - The endpoint URL
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to the response data
	 */
	delete: <T>(url: string, token?: string): Promise<T> => {
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		logger.debug("🔍 HTTP Client Debug (DELETE):");
		logger.debug("  - URL:", url);
		logger.debug("  - Token:", token);
		logger.debug("  - Headers:", headers);
		return kyClient.delete(url, { headers }).json<T>();
	},
};
