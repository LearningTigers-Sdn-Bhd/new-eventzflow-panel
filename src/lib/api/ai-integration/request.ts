import { z } from "zod";

const providerFields = {
	provider: z.string().trim().min(1, "Provider is required"),
	api_url: z
		.string()
		.trim()
		.url("API URL must be a valid URL")
		.refine((value) => value.startsWith("https://"), "API URL must use HTTPS"),
};

export const createAiIntegrationRequestSchema = z.object({
	ai_integration: z.object({
		...providerFields,
		api_key: z.string().trim().min(1, "API key is required"),
	}),
});

export type CreateAiIntegrationRequest = z.infer<
	typeof createAiIntegrationRequestSchema
>;

export const updateAiIntegrationRequestSchema = z.object({
	ai_integration: z.object({
		provider: providerFields.provider.optional(),
		api_url: providerFields.api_url.optional(),
		api_key: z.string().trim().min(1, "API key is required").optional(),
	}),
});

export type UpdateAiIntegrationRequest = z.infer<
	typeof updateAiIntegrationRequestSchema
>;

export const aiModelRequestSchema = z.object({
	ai_model: z.object({
		model_id: z.string().trim().min(1, "Model ID is required"),
		model_name: z.string().trim().optional(),
	}),
});

export type AiModelRequest = z.infer<typeof aiModelRequestSchema>;

export const aiModelImportRequestSchema = z.object({
	ai_models: z.object({
		models: z.array(
			z.object({
				model_id: z.string().trim().min(1),
				model_name: z.string().trim().optional(),
			}),
		),
	}),
});

export type AiModelImportRequest = z.infer<typeof aiModelImportRequestSchema>;
