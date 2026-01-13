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

// Export the base API URL for use in other modules
export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2, // Retry failed requests 2 times
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
			refetchOnWindowFocus: false, // Don't refetch on window focus to reduce unnecessary requests
		},
	},
	queryCache: new QueryCache({
		onError: (error: Error, query) => {
			// Suppress global error toasts for business matching queries
			// as they are handled locally with specific UI states or ignored to prevent spam
			const queryKey = query.queryKey;
			const suppressedKeys = ["business-matching", "event-details"];
			if (
				Array.isArray(queryKey) &&
				queryKey.some(
					(k) => typeof k === "string" && suppressedKeys.some((sk) => k.includes(sk)),
				)
			) {
				return;
			}

			// onError is called after all retries are exhausted
			// Show error toast with retry option
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries({ queryKey: query.queryKey });
					},
				},
			});
		},
	}),
});

export const kyClient = ky.create({
	prefixUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
	timeout: 90000,
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

				// Remove Content-Type header for GET requests (GET requests should not have a body)
				if (request.method === "GET") {
					request.headers.delete("Content-Type");
				}

				// Attach token if not already present
				if (!request.headers.has("Authorization")) {
					const isHydrated =
						typeof window !== "undefined" &&
						useUserSessionStore.persist?.hasHydrated();
					if (typeof window !== "undefined" && !isHydrated) {
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

// A public ky client that doesn't require authentication
// Use this for public-facing pages that should be accessible without login
export const kyPublicClient = ky.create({
	prefixUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
	retry: {
		limit: 3,
		methods: ["get", "post"],
		statusCodes: [408, 429, 500, 502, 503, 504],
	},
	hooks: {
		beforeRequest: [
			(request) => {
				// Remove Content-Type header for GET requests
				if (request.method === "GET") {
					request.headers.delete("Content-Type");
				}
				// No authentication token is attached for public requests
			},
		],
	},
});

// A public ky client for multipart/form-data uploads (no auth, no default Content-Type)
// Use this for public endpoints that accept file uploads
export const kyPublicClientForFormData = ky.create({
	prefixUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
	timeout: 60000,
	// Note: Do NOT set default Content-Type so the browser can set multipart/form-data with boundary
	retry: {
		limit: 3,
		methods: ["post"],
		statusCodes: [408, 429, 500, 502, 503, 504],
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
					const isHydrated =
						typeof window !== "undefined" &&
						useUserSessionStore.persist?.hasHydrated();
					if (typeof window !== "undefined" && !isHydrated) {
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
	 * Make a POST request that returns a blob (for file downloads)
	 * @param url - The endpoint URL
	 * @param data - Optional request body data
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to an object with blob and response headers
	 */
	postBlob: async (
		url: string,
		data?: unknown,
		token?: string,
	): Promise<{ blob: Blob; headers: Headers }> => {
		const headers: Record<string, string> = token
			? { Authorization: `Bearer ${token}` }
			: {};
		logger.debug("🔍 HTTP Client Debug (POST BLOB):");
		logger.debug("  - URL:", url);
		logger.debug("  - Token:", token);
		logger.debug("  - Data:", data);
		logger.debug("  - Headers:", headers);
		const response = await kyClient.post(url, { json: data, headers });
		const blob = await response.blob();
		return { blob, headers: response.headers };
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

	/**
	 * Make a PATCH request with FormData for file uploads
	 * @param url - The endpoint URL
	 * @param formData - FormData object containing files and other fields
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to the response data
	 */
	patchFormData: <T>(
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

		logger.debug("🔍 HTTP Client Debug (PATCH FORM DATA):");
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

		return kyClientForFormData.patch(url, requestOptions).json<T>();
	},

	/**
	 * Make a PUT request with FormData for file uploads
	 * @param url - The endpoint URL
	 * @param formData - FormData object containing files and other fields
	 * @param token - Optional token to override the default auth token
	 * @returns Promise resolving to the response data
	 */
	putFormData: <T>(
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

		logger.debug("🔍 HTTP Client Debug (PUT FORM DATA):");
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

		return kyClientForFormData.put(url, requestOptions).json<T>();
	},

	/**
	 * Get the full URL for an image endpoint
	 * @param path - The image path (e.g., "v1/voucher_images/filename.jpg")
	 * @returns Full URL to access the image
	 */
	getImageUrl: (path: string): string => {
		// Remove leading slash if present to avoid double slashes
		const cleanPath = path.startsWith("/") ? path.slice(1) : path;
		return `${API_BASE_URL}/${cleanPath}`;
	},
};

/**
 * Public REST API client - does NOT require authentication
 * Use this for public-facing pages that should be accessible without login
 */
export const publicRestClient = {
	/**
	 * Make a GET request without authentication
	 * @param url - The endpoint URL
	 * @returns Promise resolving to the response data
	 */
	get: <T>(url: string): Promise<T> => {
		logger.debug("🔍 Public HTTP Client Debug (GET):");
		logger.debug("  - URL:", url);
		return kyPublicClient.get(url).json<T>();
	},

	/**
	 * Make a POST request without authentication
	 * @param url - The endpoint URL
	 * @param data - Optional request body data
	 * @returns Promise resolving to the response data
	 */
	post: <T>(url: string, data?: unknown): Promise<T> => {
		logger.debug("🔍 Public HTTP Client Debug (POST):");
		logger.debug("  - URL:", url);
		logger.debug("  - Data:", data);
		return kyPublicClient.post(url, { json: data }).json<T>();
	},

	/**
	 * Get the full URL for an image endpoint
	 * @param path - The image path (e.g., "v1/voucher_images/filename.jpg")
	 * @returns Full URL to access the image
	 */
	getImageUrl: (path: string): string => {
		// Remove leading slash if present to avoid double slashes
		const cleanPath = path.startsWith("/") ? path.slice(1) : path;
		return `${API_BASE_URL}/${cleanPath}`;
	},
};
