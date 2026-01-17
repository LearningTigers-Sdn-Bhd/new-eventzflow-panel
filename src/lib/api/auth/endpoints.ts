import { useUserSessionStore } from "@/stores/new-auth-store";
import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import {
	type LoginRequest,
	loginRequestSchema,
	type RegisterRequest,
	type RegisterRequestData,
	type RequestResetPasswordRequest,
	type ResetPasswordRequest,
	registerRequestSchema,
	requestResetPasswordSchema,
	resetPasswordSchema,
	type UpdatePasswordRequest,
	updatePasswordRequestSchema,
	type VerifyResetPasswordRequest,
	verifyResetPasswordRequestSchema,
} from "./request";
import {
	type AuthResponse,
	authResponseSchema,
	type RefreshTokenResponse,
	type RequestResetPasswordResponse,
	type ResetPasswordResponse,
	refreshTokenResponseSchema,
	requestResetPasswordResponseSchema,
	resetPasswordResponseSchema,
	type UpdatePasswordResponse,
	updatePasswordResponseSchema,
	type VerifyEmailResponse,
	verifyEmailResponseSchema,
} from "./response";

// Token refresh state management
let refreshPromise: Promise<string> | null = null;

/**
 * Convert expires_at string to timestamp
 */
function parseExpiresAt(expiresAt: string): number {
	return new Date(expiresAt).getTime();
}

/**
 * Check if token is expired or expiring soon (within 5 minutes)
 */
function isTokenExpiringSoon(expiresAt: number): boolean {
	const now = Date.now();
	const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
	return expiresAt - now <= fiveMinutes;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(): Promise<string> {
	// Prevent multiple simultaneous refresh attempts
	if (refreshPromise) {
		return refreshPromise;
	}

	const state = useUserSessionStore.getState();

	refreshPromise = (async () => {
		try {
			// No request body needed, cookie contains refresh token
			// We send an empty object as body because it's a POST request
			const response = await restClient.post<RefreshTokenResponse>(
				"v1/auth/refresh_token",
				{},
			);

			// Validate response
			const validatedResponse = refreshTokenResponseSchema.parse(response);

			if (!validatedResponse.success) {
				throw new Error(validatedResponse.message || "Token refresh failed");
			}

			const { access_token, expires_at, user } = validatedResponse.data;
			const expiresAtTimestamp = parseExpiresAt(expires_at);

			// Update store with new tokens
			// Note: We don't store refresh_token anymore, it's in the HttpOnly cookie
			state.setSessionCredentials({
				accessToken: access_token,
				expiresAt: expiresAtTimestamp,
			});
			state.setUser(user);

			return access_token;
		} catch (error) {
			// If refresh fails, the session is unrecoverable.
			// Log the user out to force re-authentication.
			logout();

			if (error instanceof Error && error.name === "ZodError") {
				throw new Error("Invalid refresh token response");
			}
			throw error;
		} finally {
			refreshPromise = null;
		}
	})();

	return refreshPromise;
}

/**
 * Login user with email and password
 */
export async function login(
	email: string,
	password: string,
): Promise<AuthResponse> {
	try {
		// Validate login request
		const loginRequest: LoginRequest = {
			user: { email, password },
		};

		const validatedRequest = loginRequestSchema.parse(loginRequest);

		const response = await restClient.post<AuthResponse>(
			"v1/auth/login",
			validatedRequest,
		);

		// Validate response
		const validatedResponse = authResponseSchema.parse(response);

		        const { access_token, expires_at, user } =
		            validatedResponse.data;
		        const expiresAtTimestamp = parseExpiresAt(expires_at);
		
		        // Update store with tokens and user data
		        const state = useUserSessionStore.getState();
		        state.setSessionCredentials({
		            accessToken: access_token,
		            expiresAt: expiresAtTimestamp,
		        });
		        state.setUser(user);
		return validatedResponse;
	} catch (error) {
		// Handle validation errors
		if (error instanceof Error && error.name === "ZodError") {
			throw new Error("Invalid login data provided");
		}

		// Extract and throw user-friendly error message
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Register new user
 */
export async function register(
	userData: RegisterRequestData,
): Promise<AuthResponse> {
	try {
		// Validate register request
		const registerRequest: RegisterRequest = {
			user: userData,
		};

		const validatedRequest = registerRequestSchema.parse(registerRequest);

		const response = await restClient.post<AuthResponse>(
			"v1/auth/register",
			validatedRequest,
		);

		// Validate response
		const validatedResponse = authResponseSchema.parse(response);

		if (!validatedResponse.success) {
			throw new Error(validatedResponse.message || "Registration failed");
		}

		const { access_token, expires_at, user } =
			validatedResponse.data;
		const expiresAtTimestamp = parseExpiresAt(expires_at);

		// Update store with tokens and user data
		const state = useUserSessionStore.getState();
		state.setSessionCredentials({
			accessToken: access_token,
			expiresAt: expiresAtTimestamp,
		});
		state.setUser(user);

		return validatedResponse;
	} catch (error) {
		// Handle validation errors
		if (error instanceof Error && error.name === "ZodError") {
			throw new Error("Invalid registration data provided");
		}

		// Extract and throw user-friendly error message
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
	try {
		// Call logout endpoint if available (optional)
		await restClient.delete("v1/auth/logout");
	} catch (error) {
		// Ignore logout endpoint errors, still clear local session
		console.warn("Logout endpoint failed:", error);
	}

	// Clear local session
	const state = useUserSessionStore.getState();
	state.removeSessionCredentials();
	state.setUser(null);
}

/**
 * Check if current token is expired or expiring soon
 */
export function isTokenExpired(): boolean {
	const state = useUserSessionStore.getState();
	const credentials = state.sessionCredentials;

	if (!credentials) return true;

	return isTokenExpiringSoon(credentials.expiresAt);
}

/**
 * Get current access token, refreshing if needed
 */
export async function getAccessToken(): Promise<string | null> {
	const state = useUserSessionStore.getState();
	const credentials = state.sessionCredentials;

	if (!credentials) return null;

	if (isTokenExpiringSoon(credentials.expiresAt)) {
		try {
			return await refreshToken();
		} catch (error) {
			console.error("Failed to refresh token:", error);
			return null;
		}
	}

	return credentials.accessToken;
}

/**
 * Send verification code to user email
 */
export async function sendVerificationCode(): Promise<void> {
	try {
		await restClient.post("v1/auth/send-verification-code", {});
	} catch (error) {
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Verify email with 6-digit code
 */
export async function verifyEmail(code: string): Promise<VerifyEmailResponse> {
	try {
		const response = await restClient.post<VerifyEmailResponse>(
			"v1/auth/verify-email",
			{ code },
		);

		// Validate response
		const validatedResponse = verifyEmailResponseSchema.parse(response);

		if (!validatedResponse.success) {
			throw new Error(validatedResponse.message || "Email verification failed");
		}

		// Update user in store with updated email_verified status
		const state = useUserSessionStore.getState();
		state.setUser(validatedResponse.data.user);

		return validatedResponse;
	} catch (error) {
		// Handle validation errors
		if (error instanceof Error && error.name === "ZodError") {
			throw new Error("Invalid verification response");
		}

		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Request a password reset email
 */
export async function requestPasswordReset(
	email: string,
): Promise<RequestResetPasswordResponse> {
	try {
		const payload: RequestResetPasswordRequest =
			requestResetPasswordSchema.parse({ email });
		const response = await restClient.post<RequestResetPasswordResponse>(
			"v1/auth/password/request_reset_password",
			payload,
		);
		return requestResetPasswordResponseSchema.parse(response);
	} catch (error) {
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Verify reset password request token validity
 * Returns true if valid; throws on failure (e.g., 422)
 */
export async function verifyResetPasswordRequest(
	token: string,
): Promise<boolean> {
	try {
		const { token: validatedToken }: VerifyResetPasswordRequest =
			verifyResetPasswordRequestSchema.parse({ token });
		// Using query string since restClient.get doesn't accept params object
		await restClient.get(
			`v1/auth/password/verify_reset_password_request?token=${encodeURIComponent(
				validatedToken,
			)}`,
		);
		return true;
	} catch (error) {
		// Surface a friendly error; caller can decide to redirect
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Reset password using token
 */
export async function resetPassword(
	data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
	try {
		const payload = resetPasswordSchema.parse(data);
		const response = await restClient.post<ResetPasswordResponse>(
			"v1/auth/password/reset_password",
			payload,
		);
		return resetPasswordResponseSchema.parse(response);
	} catch (error) {
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Update password for authenticated user
 */
export async function updatePassword(
	data: UpdatePasswordRequest,
): Promise<UpdatePasswordResponse> {
	try {
		const payload = updatePasswordRequestSchema.parse(data);
		const response = await restClient.patch<UpdatePasswordResponse>(
			"v1/auth/password",
			payload,
		);
		const validated = updatePasswordResponseSchema.parse(response);
		if (validated.success) {
			const { access_token, expires_at } = validated.data;
			const expiresAtTimestamp = new Date(expires_at).getTime();
			const state = useUserSessionStore.getState();
			state.setSessionCredentials({
				accessToken: access_token,
				expiresAt: expiresAtTimestamp,
			});
		}
		return validated;
	} catch (error) {
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}
