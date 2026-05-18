import { restClient } from "@/utils/rest-api";
import {
	type CreateApiKeyRequest,
	createApiKeySchema,
	type DeleteApiKeyRequest,
	deleteApiKeySchema,
} from "./request";
import type {
	ApiKey,
	ApiKeyCreation,
	BackendApiKey,
	BackendApiKeyCreation,
	CreateApiKeyResponse,
	DeleteApiKeyResponse,
} from "./response";

// Transform backend response to frontend format (list)
function transformApiKey(backendKey: BackendApiKey): ApiKey {
	return {
		id: String(backendKey.id),
		name: backendKey.name,
		lastUsedAt: backendKey.last_used_at,
		createdAt: backendKey.created_at,
		isActive: backendKey.is_active,
		eventId: backendKey.event_id ?? null,
	};
}

// Transform backend response to frontend format (creation)
function transformApiKeyCreation(
	backendKey: BackendApiKeyCreation,
): ApiKeyCreation {
	return {
		id: String(backendKey.id), // Ensure ID is always a string
		name: backendKey.name,
		rawKey: backendKey.raw_key,
		message: backendKey.message,
	};
}

/**
 * Get all API keys for a specific event
 */
export async function getEventApiKeys(eventId: number): Promise<ApiKey[]> {
	try {
		const response = await restClient.get<BackendApiKey[]>(
			`v1/events/${eventId}/api_keys`,
		);
		return response.map(transformApiKey);
	} catch (error: any) {
		throw new Error(error.message || "Failed to fetch event API keys");
	}
}

/**
 * Create a new API key scoped to a specific event
 */
export async function createEventApiKey(
	eventId: number,
	name: string,
): Promise<CreateApiKeyResponse> {
	try {
		const response = await restClient.post<BackendApiKeyCreation>(
			`v1/events/${eventId}/api_keys`,
			{ name },
		);
		return { success: true, apiKey: transformApiKeyCreation(response) };
	} catch (error: any) {
		throw new Error(error.message || "Failed to create event API key");
	}
}

/**
 * Revoke an event-scoped API key
 */
export async function deleteEventApiKey(
	eventId: number,
	keyId: string,
): Promise<DeleteApiKeyResponse> {
	try {
		await restClient.delete(`v1/events/${eventId}/api_keys/${keyId}`);
		return { success: true, message: "API key revoked successfully" };
	} catch (error: any) {
		throw new Error(error.message || "Failed to delete event API key");
	}
}

/**
 * Get all API keys (only metadata, no raw keys)
 */
export async function getApiKeys(): Promise<ApiKey[]> {
	try {
		const response = await restClient.get<BackendApiKey[]>("v1/api_keys");
		return response.map(transformApiKey);
	} catch (error: any) {
		console.error("Error fetching API keys:", error);
		throw new Error(error.message || "Failed to fetch API keys");
	}
}

/**
 * Create a new API key for the current user
 */
export async function createApiKey(
	data: CreateApiKeyRequest,
): Promise<CreateApiKeyResponse> {
	try {
		const validated = createApiKeySchema.parse(data);

		const response = await restClient.post<BackendApiKeyCreation>(
			"v1/api_keys",
			{ name: validated.name },
		);

		return {
			success: true,
			apiKey: transformApiKeyCreation(response),
		};
	} catch (error: any) {
		console.error("Error creating API key:", error);
		throw new Error(error.message || "Failed to create API key");
	}
}

/**
 * Revoke an API key
 */
export async function deleteApiKey(
	data: DeleteApiKeyRequest,
): Promise<DeleteApiKeyResponse> {
	try {
		const validated = deleteApiKeySchema.parse(data);

		await restClient.delete(`v1/api_keys/${validated.id}`);

		return {
			success: true,
			message: "API key revoked successfully",
		};
	} catch (error: any) {
		console.error("Error deleting API key:", error);
		throw new Error(error.message || "Failed to delete API key");
	}
}
