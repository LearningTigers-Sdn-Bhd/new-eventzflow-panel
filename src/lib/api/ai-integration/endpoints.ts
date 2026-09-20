import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import {
	type AiModelRequest,
	aiModelImportRequestSchema,
	aiModelRequestSchema,
	type CreateAiIntegrationRequest,
	createAiIntegrationRequestSchema,
	type UpdateAiIntegrationRequest,
	updateAiIntegrationRequestSchema,
} from "./request";
import {
	type AiIntegration,
	type AiIntegrationsResponse,
	type AiModel,
	type AvailableAiModel,
	aiIntegrationSchema,
	aiIntegrationsResponseSchema,
	aiModelSchema,
	aiModelsResponseSchema,
	availableAiModelsResponseSchema,
} from "./response";

async function withApiError<T>(request: () => Promise<T>): Promise<T> {
	try {
		return await request();
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
	}
}

export function getAiIntegrations(): Promise<AiIntegrationsResponse> {
	return withApiError(async () => {
		const response =
			await restClient.get<AiIntegrationsResponse>("v1/ai_integrations");
		return aiIntegrationsResponseSchema.parse(response);
	});
}

export function getAvailableAiModels(
	integrationId: number,
): Promise<AvailableAiModel[]> {
	return withApiError(async () => {
		const response = await restClient.get<AvailableAiModel[]>(
			`v1/ai_integrations/${integrationId}/available_models`,
		);
		return availableAiModelsResponseSchema.parse(response);
	});
}

export function importAiModels(
	integrationId: number,
	models: AvailableAiModel[],
): Promise<AiModel[]> {
	return withApiError(async () => {
		const payload = aiModelImportRequestSchema.parse({
			ai_models: { models },
		});
		const response = await restClient.post<AiModel[]>(
			`v1/ai_integrations/${integrationId}/ai_models/import`,
			payload,
		);
		return aiModelsResponseSchema.parse(response);
	});
}

export function createAiIntegration(
	data: CreateAiIntegrationRequest["ai_integration"],
): Promise<AiIntegration> {
	return withApiError(async () => {
		const payload = createAiIntegrationRequestSchema.parse({
			ai_integration: data,
		});
		const response = await restClient.post<AiIntegration>(
			"v1/ai_integrations",
			payload,
		);
		return aiIntegrationSchema.parse(response);
	});
}

export function updateAiIntegration(
	id: number,
	data: UpdateAiIntegrationRequest["ai_integration"],
): Promise<AiIntegration> {
	return withApiError(async () => {
		const payload = updateAiIntegrationRequestSchema.parse({
			ai_integration: data,
		});
		const response = await restClient.patch<AiIntegration>(
			`v1/ai_integrations/${id}`,
			payload,
		);
		return aiIntegrationSchema.parse(response);
	});
}

export function deleteAiIntegration(id: number): Promise<void> {
	return withApiError(() => restClient.delete(`v1/ai_integrations/${id}`));
}

export function createAiModel(
	integrationId: number,
	data: AiModelRequest["ai_model"],
): Promise<AiModel> {
	return withApiError(async () => {
		const payload = aiModelRequestSchema.parse({ ai_model: data });
		const response = await restClient.post<AiModel>(
			`v1/ai_integrations/${integrationId}/ai_models`,
			payload,
		);
		return aiModelSchema.parse(response);
	});
}

export function updateAiModel(
	integrationId: number,
	modelId: number,
	data: AiModelRequest["ai_model"],
): Promise<AiModel> {
	return withApiError(async () => {
		const payload = aiModelRequestSchema.parse({ ai_model: data });
		const response = await restClient.patch<AiModel>(
			`v1/ai_integrations/${integrationId}/ai_models/${modelId}`,
			payload,
		);
		return aiModelSchema.parse(response);
	});
}

export function deleteAiModel(
	integrationId: number,
	modelId: number,
): Promise<void> {
	return withApiError(() =>
		restClient.delete(
			`v1/ai_integrations/${integrationId}/ai_models/${modelId}`,
		),
	);
}

export function setDefaultAiModel(
	integrationId: number,
	modelId: number,
): Promise<AiModel> {
	return withApiError(async () => {
		const response = await restClient.patch<AiModel>(
			`v1/ai_integrations/${integrationId}/ai_models/${modelId}/set_default`,
			{},
		);
		return aiModelSchema.parse(response);
	});
}
