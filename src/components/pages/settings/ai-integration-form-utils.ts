export interface ProviderFormValues {
	provider: string;
	api_url: string;
	api_key: string;
}

export interface AiModelFormValues {
	model_id: string;
	model_name: string;
}

export function toProviderPayload(values: ProviderFormValues) {
	const apiKey = values.api_key.trim();

	return {
		provider: values.provider.trim(),
		api_url: values.api_url.trim(),
		...(apiKey ? { api_key: apiKey } : {}),
	};
}

export function toAiModelPayload(values: AiModelFormValues) {
	const modelName = values.model_name.trim();

	return {
		model_id: values.model_id.trim(),
		...(modelName ? { model_name: modelName } : {}),
	};
}
