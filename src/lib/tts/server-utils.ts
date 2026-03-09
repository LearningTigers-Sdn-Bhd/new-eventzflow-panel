import { prepareTtsText } from "./pronunciation";

const GOOGLE_TTS_ENDPOINT =
	"https://texttospeech.googleapis.com/v1/text:synthesize";
const RETRYABLE_STATUS = new Set([429, 503]);
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ITEMS = 200;

interface SynthesisInput {
	text: string;
	voiceId: string;
	normalizeText?: boolean;
	speakingRate?: number;
	pitch?: number;
}

interface CachedAudio {
	audioContent: string;
	expiresAt: number;
}

export interface ServerTtsResult {
	success: boolean;
	audioContent?: string;
	error?: string;
	status?: number;
}

const synthesisCache = new Map<string, CachedAudio>();

export function shouldRetryTtsStatus(status: number): boolean {
	return RETRYABLE_STATUS.has(status);
}

export function buildCacheKey(input: SynthesisInput): string {
	const normalizedText = prepareTtsText(
		input.text.trim(),
		input.normalizeText ?? true,
	);
	const speakingRate = clamp(input.speakingRate ?? 1, 0.5, 1.5);
	const pitch = clamp(input.pitch ?? 0, -10, 10);

	return JSON.stringify({
		text: normalizedText,
		voiceId: input.voiceId,
		speakingRate,
		pitch,
	});
}

export async function synthesizeViaGoogle(
	input: SynthesisInput,
): Promise<ServerTtsResult> {
	const apiKey =
		process.env.GOOGLE_CLOUD_TTS_API_KEY ??
		process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TTS_API_KEY;
	
	if (!apiKey) {
		console.warn("TTS API Key is missing. Skipping synthesis.");
		return {
			success: false,
			status: 200, // Return 200 to prevent 500 error, but success false
			error: "TTS_NOT_CONFIGURED",
		};
	}

	const trimmedText = input.text.trim();
	if (!trimmedText) {
		return { success: false, status: 400, error: "Text cannot be empty" };
	}

	const normalizedText = prepareTtsText(
		trimmedText,
		input.normalizeText ?? true,
	);
	const speakingRate = clamp(input.speakingRate ?? 1, 0.5, 1.5);
	const pitch = clamp(input.pitch ?? 0, -10, 10);

	const cacheKey = buildCacheKey(input);
	const cachedAudio = getCachedAudio(cacheKey);
	if (cachedAudio) {
		return { success: true, audioContent: cachedAudio };
	}

	const payload = {
		input: { text: normalizedText },
		voice: {
			languageCode: getLanguageCode(input.voiceId),
			name: input.voiceId,
		},
		audioConfig: {
			audioEncoding: "MP3",
			speakingRate,
			pitch,
		},
	};

	let lastError: ServerTtsResult = {
		success: false,
		status: 500,
		error: "Unknown TTS error",
	};

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const response = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			if (response.ok) {
				const data = (await response.json()) as { audioContent?: string };
				if (!data.audioContent) {
					return {
						success: false,
						status: 502,
						error: "Provider returned empty audio payload",
					};
				}

				setCachedAudio(cacheKey, data.audioContent);
				return { success: true, audioContent: data.audioContent };
			}

			const errorData = (await response.json().catch(() => ({}))) as {
				error?: { message?: string };
			};
			const providerMessage =
				errorData.error?.message ?? "TTS provider request failed";

			lastError = {
				success: false,
				status: response.status,
				error: mapProviderError(response.status, providerMessage),
			};

			if (!shouldRetryTtsStatus(response.status) || attempt === MAX_RETRIES) {
				return lastError;
			}

			await sleep(backoffDelayMs(attempt));
		} catch (error) {
			const isAbortError =
				error instanceof Error && error.name === "AbortError";
			lastError = {
				success: false,
				status: isAbortError ? 504 : 502,
				error: isAbortError
					? "TTS provider timed out. Please try again."
					: error instanceof Error
						? error.message
						: "Network error while synthesizing speech",
			};

			if (attempt === MAX_RETRIES) {
				return lastError;
			}

			await sleep(backoffDelayMs(attempt));
		} finally {
			clearTimeout(timeout);
		}
	}

	return lastError;
}

function backoffDelayMs(attempt: number): number {
	const baseDelay = 250;
	const exponential = baseDelay * 2 ** attempt;
	const jitter = Math.floor(Math.random() * 100);
	return exponential + jitter;
}

function mapProviderError(status: number, message: string): string {
	switch (status) {
		case 400:
			return message;
		case 401:
			return "Invalid TTS credentials on server.";
		case 403:
			return "TTS access denied. Check API enablement, quota, and billing.";
		case 429:
			return "TTS rate limit exceeded. Please retry shortly.";
		case 503:
			return "TTS service temporarily unavailable. Please retry shortly.";
		default:
			return message;
	}
}

function getLanguageCode(voiceId: string): string {
	const firstDashIndex = voiceId.indexOf("-");
	if (firstDashIndex < 0) {
		return "en-US";
	}

	const secondDashIndex = voiceId.indexOf("-", firstDashIndex + 1);
	if (secondDashIndex < 0) {
		return "en-US";
	}

	return voiceId.slice(0, secondDashIndex);
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function getCachedAudio(cacheKey: string): string | undefined {
	const now = Date.now();
	const cached = synthesisCache.get(cacheKey);
	if (!cached) {
		return undefined;
	}

	if (cached.expiresAt <= now) {
		synthesisCache.delete(cacheKey);
		return undefined;
	}

	return cached.audioContent;
}

function setCachedAudio(cacheKey: string, audioContent: string): void {
	const now = Date.now();
	if (synthesisCache.size >= CACHE_MAX_ITEMS) {
		const firstKey = synthesisCache.keys().next().value;
		if (firstKey) {
			synthesisCache.delete(firstKey);
		}
	}

	synthesisCache.set(cacheKey, {
		audioContent,
		expiresAt: now + CACHE_TTL_MS,
	});
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
