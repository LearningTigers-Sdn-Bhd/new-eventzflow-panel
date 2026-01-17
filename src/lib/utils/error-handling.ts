/**
 * Error handling utilities
 * Standardized error message extraction and handling
 */

/**
 * Extracts error message from unknown error type
 * Handles Error instances, string errors, and unknown types
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "An unexpected error occurred";
}

/**
 * Creates a standardized error handler for mutations
 * Returns a function that can be used as onError callback
 */
export function createErrorHandler(defaultMessage: string) {
	return (error: unknown) => {
		const message = getErrorMessage(error);
		return {
			message: message || defaultMessage,
			error,
		};
	};
}
