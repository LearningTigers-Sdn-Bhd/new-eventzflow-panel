/**
 * Backend unified error response format
 * Based on Swagger documentation at /api-docs
 */
export interface BackendErrorResponse {
	success?: boolean;
	message?: string;
	error?: string;
	errors?: Array<{ field: string; message: string }>;
}

/**
 * Extract user-friendly error message from backend error response
 * Handles the unified error format used across all backend API endpoints
 *
 * @param error - The error object (typically from ky HTTPError)
 * @returns A user-friendly error message
 *
 * @example
 * ```typescript
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   const message = await extractErrorMessage(error);
 *   toast.error(message);
 * }
 * ```
 */
export async function extractErrorMessage(error: unknown): Promise<string> {
	// Handle HTTP errors from ky
	if (error && typeof error === "object" && "response" in error) {
		try {
			const httpError = error as {
				response: { json: () => Promise<unknown> };
			};
			const errorData =
				(await httpError.response.json()) as BackendErrorResponse;

			// Extract user-friendly error message from backend response
			if (errorData.error) {
				return errorData.error;
			}if (errorData.errors && errorData.errors.length > 0) {
				return errorData.errors.map((e) => e.message).join(", ");
			}if (errorData.message) {
				return errorData.message;
			}
		} catch {
			// If we can't parse the error, fall through to generic message
		}
	}

	return "An error occurred. Please try again.";
}

/**
 * Type guard to check if an error is a backend error response
 */
export function isBackendErrorResponse(
	error: unknown,
): error is BackendErrorResponse {
	return (
		typeof error === "object" &&
		error !== null &&
		("message" in error || "errors" in error)
	);
}
