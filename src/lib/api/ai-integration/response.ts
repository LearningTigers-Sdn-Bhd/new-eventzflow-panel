import { z } from "zod";

export const aiModelSchema = z.object({
	id: z.number(),
	ai_integration_id: z.number(),
	model_id: z.string(),
	model_name: z.string(),
	is_default: z.boolean(),
	created_at: z.string(),
	updated_at: z.string(),
});

export type AiModel = z.infer<typeof aiModelSchema>;

export const aiModelsResponseSchema = z.array(aiModelSchema);

export const aiIntegrationSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	provider: z.string(),
	api_url: z.string(),
	has_api_key: z.boolean(),
	models: z.array(aiModelSchema),
	created_at: z.string(),
	updated_at: z.string(),
});

export type AiIntegration = z.infer<typeof aiIntegrationSchema>;

export const aiIntegrationsResponseSchema = z.array(aiIntegrationSchema);

export type AiIntegrationsResponse = AiIntegration[];

export const availableAiModelSchema = z.object({
	model_id: z.string(),
	model_name: z.string(),
});

export type AvailableAiModel = z.infer<typeof availableAiModelSchema>;

export const availableAiModelsResponseSchema = z.array(availableAiModelSchema);
