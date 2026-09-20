import { describe, expect, test } from "bun:test";
import {
	toAiModelPayload,
	toProviderPayload,
} from "./ai-integration-form-utils";

describe("toProviderPayload", () => {
	test("omits a blank API key so existing credentials are preserved", () => {
		expect(
			toProviderPayload({
				provider: " OpenRouter ",
				api_url: " https://openrouter.ai/api/v1 ",
				api_key: "   ",
			}),
		).toEqual({
			provider: "OpenRouter",
			api_url: "https://openrouter.ai/api/v1",
		});
	});

	test("includes a newly entered API key", () => {
		expect(
			toProviderPayload({
				provider: "OpenAI",
				api_url: "https://api.openai.com/v1",
				api_key: " replacement-secret ",
			}),
		).toEqual({
			provider: "OpenAI",
			api_url: "https://api.openai.com/v1",
			api_key: "replacement-secret",
		});
	});
});

describe("toAiModelPayload", () => {
	test("trims the required model ID and display name", () => {
		expect(
			toAiModelPayload({
				model_id: " cx/gpt-5.6 ",
				model_name: " GPT 5.6 ",
			}),
		).toEqual({ model_id: "cx/gpt-5.6", model_name: "GPT 5.6" });
	});

	test("omits a blank display name for auto-discovered models", () => {
		expect(
			toAiModelPayload({ model_id: "gcli/grok-4.6", model_name: " " }),
		).toEqual({ model_id: "gcli/grok-4.6" });
	});
});
