import { useUserSessionStore } from "@/stores/new-auth-store";
import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import {
	type UpdateProfileRequest,
	type UpdateProfileRequestData,
	updateProfileRequestSchema,
} from "./request";
import {
	type ProfileResponse,
	profileResponseSchema,
	type User,
} from "./response";

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
	try {
		const response = await restClient.get<ProfileResponse>("v1/users/profile");

		// Validate response
		const validatedResponse = profileResponseSchema.parse(response);

		if (!validatedResponse.success) {
			throw new Error(
				validatedResponse.message || "Failed to fetch user profile",
			);
		}

		const user = validatedResponse.data;

		// Update store with user data
		const state = useUserSessionStore.getState();
		state.setUser(user);

		return user;
	} catch (error) {
		// Handle validation errors
		if (error instanceof Error && error.name === "ZodError") {
			throw new Error("Invalid user profile data");
		}

		// Extract and throw user-friendly error message
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Update current user profile
 */
export async function updateCurrentUser(
	userData: UpdateProfileRequestData,
): Promise<User> {
	try {
		// Validate update profile request
		const updateRequest: UpdateProfileRequest = {
			user: userData,
		};

		const validatedRequest = updateProfileRequestSchema.parse(updateRequest);

		const response = await restClient.put<ProfileResponse>(
			"v1/users/profile",
			validatedRequest,
		);

		// Validate response
		const validatedResponse = profileResponseSchema.parse(response);

		if (!validatedResponse.success) {
			throw new Error(
				validatedResponse.message || "Failed to update user profile",
			);
		}

		const user = validatedResponse.data;

		// Update store with updated user data
		const state = useUserSessionStore.getState();
		state.setUser(user);

		return user;
	} catch (error) {
		// Handle validation errors
		if (error instanceof Error && error.name === "ZodError") {
			throw new Error("Invalid profile update data");
		}

		// Extract and throw user-friendly error message
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}
