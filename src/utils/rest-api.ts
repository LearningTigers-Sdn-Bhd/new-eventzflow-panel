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

// A dedicated ky client for multipart/form-data uploads (no default Content-Type)
export const kyClientForFormData = ky.create({
	prefixUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
	timeout: 30000,
	// Note: Do NOT set default headers here so the browser can set the multipart boundary
	retry: {
		limit: 3,
		methods: ["get", "post", "put", "delete", "patch"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
	hooks: {
		beforeRequest: [
			async (request) => {
				// Wait for token refresh if needed
				try {
					await refreshQueueService.waitForRefreshIfNeeded(request);
				} catch (error) {
					console.error(
						"Token refresh failed in beforeRequest (FormData):",
						error,
					);
				}

				// Attach token if not already present
				if (!request.headers.has("Authorization")) {
					const isHydrated = useUserSessionStore.persist.hasHydrated();
					if (!isHydrated) {
						logger.debug("⚠️ Store not hydrated yet, waiting... (FormData)");
						return;
					}

					const credentials = useUserSessionStore.getState().sessionCredentials;
					if (credentials?.accessToken) {
						request.headers.set(
							"Authorization",
							`Bearer ${credentials.accessToken}`,
						);
						logger.debug("✅ Token attached to request (FormData):", {
							url: request.url,
							tokenPreview: `${credentials.accessToken.substring(0, 20)}...`,
						});
					} else {
						logger.debug("⚠️ No access token available (FormData)");
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
	 * Make a GET request that returns a blob (for file downloads)
	 * @param url - The endpoint URL
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to an object with blob and response headers
	 */
	getBlob: async (
		url: string,
		token?: string,
	): Promise<{ blob: Blob; headers: Headers }> => {
		const headers: Record<string, string> = token
			? { Authorization: `Bearer ${token}` }
			: {};
		// Remove Content-Type header for blob downloads (not needed for GET requests)
		const requestOptions = {
			headers,
			// Explicitly exclude Content-Type from default headers
			hooks: {
				beforeRequest: [
					(request: Request) => {
						// Remove Content-Type header if present (from kyClient defaults)
						request.headers.delete("Content-Type");
					},
				],
			},
		};
		logger.debug("🔍 HTTP Client Debug (GET BLOB):");
		logger.debug("  - URL:", url);
		logger.debug("  - Token:", token);
		logger.debug("  - Headers:", headers);
		const response = await kyClient.get(url, requestOptions);
		const blob = await response.blob();
		return { blob, headers: response.headers };
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

	/**
	 * Make a POST request with FormData for file uploads
	 * @param url - The endpoint URL
	 * @param formData - FormData object containing files and other fields
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to the response data
	 */
	postFormData: <T>(
		url: string,
		formData: FormData,
		token?: string,
	): Promise<T> => {
		const headers: Record<string, string> = token
			? { Authorization: `Bearer ${token}` }
			: {};

		// Do NOT set Content-Type; let the browser set multipart/form-data with boundary
		const requestOptions = {
			body: formData,
			headers,
		} as const;

		logger.debug("🔍 HTTP Client Debug (POST FORM DATA):");
		logger.debug("  - URL:", url);
		logger.debug("  - Token:", token);
		logger.debug("  - Headers:", headers);
		logger.debug(
			"  - FormData entries:",
			Array.from(formData.entries()).map(([key, value]) =>
				value instanceof File
					? [key, `File: ${value.name} (${value.size} bytes)`]
					: [key, value],
			),
		);

		return kyClientForFormData.post(url, requestOptions).json<T>();
	},
};
