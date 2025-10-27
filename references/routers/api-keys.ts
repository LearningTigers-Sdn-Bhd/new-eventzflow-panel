import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedHttpClient } from "../lib/http-client";
import { protectedProcedure, router } from "../index";

// Backend API response type for API Key (GET /v1/api_keys)
type BackendApiKey = {
	id: string;
	name: string;
	last_used_at: string | null;
	created_at: string;
};

// Backend API response type for API Key creation (POST /v1/api_keys)
type BackendApiKeyCreation = {
	id: string;
	name: string;
	raw_key: string;
	message: string;
};

// Frontend API key type (for list display)
export type ApiKey = {
	id: string;
	name: string;
	lastUsedAt: string | null;
	createdAt: string;
};

// Frontend API key creation response
export type ApiKeyCreation = {
	id: string;
	name: string;
	rawKey: string;
	message: string;
};

// Transform backend response to frontend format (list)
function transformApiKey(backendKey: BackendApiKey): ApiKey {
	return {
		id: String(backendKey.id), // Ensure ID is always a string
		name: backendKey.name,
		lastUsedAt: backendKey.last_used_at,
		createdAt: backendKey.created_at,
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

// Validation schema for creating an API key
const createApiKeySchema = z.object({
	name: z.string().min(1, "API Key name is required").max(255, "API Key name must be less than 255 characters"),
});

// Validation schema for deleting an API key
const deleteApiKeySchema = z.object({
	id: z.string().min(1, "API Key ID is required"),
});

export const apiKeysRouter = router({
	// GET /v1/api_keys - List all API keys (only metadata, no raw keys)
	getApiKeys: protectedProcedure.query(async ({ ctx }) => {
		try {
			const response = await protectedHttpClient.get<BackendApiKey[]>(
				"v1/api_keys",
				ctx.token,
			);

			return response.map(transformApiKey);
		} catch (error: any) {
			console.error("Error fetching API keys:", error);

			if (error.response?.status === 401) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Unauthorized to access API keys",
				});
			}

			if (error.response?.status === 403) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization owners can access API keys",
				});
			}

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: error.message || "Failed to fetch API keys",
			});
		}
	}),

	// POST /v1/api_keys - Create a new API key for the current user
	createApiKey: protectedProcedure
		.input(createApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.post<BackendApiKeyCreation>(
					"v1/api_keys",
					{
						name: input.name,
					},
					ctx.token,
				);

			return {
				success: true,
				apiKey: transformApiKeyCreation(response),
			};
		} catch (error: any) {
			console.error("Error creating API key:", error);

			if (error.response?.status === 401) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Unauthorized to create API keys",
				});
			}

			if (error.response?.status === 403) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only organization owners can create API keys",
				});
			}

			if (error.response?.status === 422) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						error.response?.data?.errors?.join(", ") ||
						"Failed to create API key",
				});
			}

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: error.message || "Failed to create API key",
			});
		}
	}),

	// DELETE /v1/api_keys/:id - Revoke an API key
	deleteApiKey: protectedProcedure
		.input(deleteApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			try {
				await protectedHttpClient.delete(
					`v1/api_keys/${input.id}`,
					ctx.token,
				);

				return {
					success: true,
					message: "API key revoked successfully",
				};
			} catch (error: any) {
				console.error("Error deleting API key:", error);

				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to delete API keys",
					});
				}

				if (error.response?.status === 403) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Only organization owners can delete API keys",
					});
				}

				if (error.response?.status === 404) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "API key not found",
					});
				}

				if (error.response?.status === 422) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Failed to revoke API key",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to delete API key",
				});
			}
		}),
});
