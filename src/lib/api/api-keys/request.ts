import { z } from "zod";

export const apiKeyScopeSchema = z.enum([
	"read_only",
	"check_in",
	"read_write",
]);

// Validation schema for creating an API key
export const createApiKeySchema = z.object({
	name: z
		.string()
		.min(1, "API Key name is required")
		.max(255, "API Key name must be less than 255 characters"),
	scope: apiKeyScopeSchema.optional(),
});

// Validation schema for deleting an API key
export const deleteApiKeySchema = z.object({
	id: z.string().min(1, "API Key ID is required"),
});

// Type exports for request data
export type CreateApiKeyRequest = z.infer<typeof createApiKeySchema>;
export type DeleteApiKeyRequest = z.infer<typeof deleteApiKeySchema>;
export type ApiKeyScopeInput = z.infer<typeof apiKeyScopeSchema>;
