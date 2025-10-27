import type { QueryKey } from "@tanstack/react-query";

/**
 * Health Check Query Options
 *
 * Provides query options for checking the health status of the Next.js API backend.
 * Returns a boolean indicating whether the API is connected and healthy.
 * Currently returns mock data for development/testing purposes.
 *
 * @returns Query options compatible with @tanstack/react-query's useQuery hook
 */
export function healthCheckQuery() {
	return {
		queryKey: ["health-check"] as QueryKey,
		queryFn: async (): Promise<boolean> => {
			// Mock data - simulate API health check
			// In development, randomly return true/false to test both states
			if (process.env.NODE_ENV === "development") {
				// Simulate occasional failures for testing
				return Math.random() > 0.1; // 90% success rate
			}

			// In production, always return true (assuming API is healthy)
			return true;
		},
		staleTime: 30000, // 30 seconds
		refetchInterval: 60000, // Refetch every minute
		retry: 2,
	};
}
