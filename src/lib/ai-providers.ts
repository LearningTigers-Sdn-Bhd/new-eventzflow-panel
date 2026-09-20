export const CUSTOM_AI_PROVIDER_VALUE = "custom";

export const AI_PROVIDER_PRESETS = [
	{
		value: "openai",
		name: "OpenAI",
		apiUrl: "https://api.openai.com/v1",
	},
	{
		value: "deepseek",
		name: "DeepSeek",
		apiUrl: "https://api.deepseek.com",
	},
	{
		value: "openrouter",
		name: "OpenRouter",
		apiUrl: "https://openrouter.ai/api/v1",
	},
	{
		value: "groq",
		name: "Groq",
		apiUrl: "https://api.groq.com/openai/v1",
	},
	{
		value: "mistral",
		name: "Mistral",
		apiUrl: "https://api.mistral.ai/v1",
	},
	{
		value: "xai",
		name: "xAI",
		apiUrl: "https://api.x.ai/v1",
	},
	{
		value: "google-gemini",
		name: "Google Gemini",
		apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
] as const;

export type AiProviderPreset = (typeof AI_PROVIDER_PRESETS)[number];

export function findAiProviderPreset(providerName: string) {
	const normalizedName = providerName.trim().toLowerCase();

	return AI_PROVIDER_PRESETS.find(
		(provider) => provider.name.toLowerCase() === normalizedName,
	);
}
