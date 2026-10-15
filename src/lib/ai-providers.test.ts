import { describe, expect, test } from "bun:test";
import { AI_PROVIDER_PRESETS, findAiProviderPreset } from "./ai-providers";

describe("AI provider presets", () => {
	test("includes common OpenAI-compatible providers with base URLs", () => {
		expect(AI_PROVIDER_PRESETS.map((provider) => provider.name)).toEqual([
			"OpenAI",
			"DeepSeek",
			"OpenRouter",
			"Groq",
			"Mistral",
			"xAI",
			"Google Gemini",
		]);
		expect(findAiProviderPreset(" OpenAI ")?.apiUrl).toBe(
			"https://api.openai.com/v1",
		);
	});

	test("returns no preset for a custom provider name", () => {
		expect(findAiProviderPreset("Xavier AI")).toBeUndefined();
	});
});
