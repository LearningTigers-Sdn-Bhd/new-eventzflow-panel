/**
 * Google Cloud Text-to-Speech Service
 *
 * Handles speech synthesis via Google Cloud TTS REST API.
 *
 * @see https://cloud.google.com/text-to-speech/docs/reference/rest
 */

import { prepareTtsText } from "./pronunciation";
import type { VoiceId } from "./voices";

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

/**
 * TTS configuration from environment.
 * API key should be set via NEXT_PUBLIC_GOOGLE_CLOUD_TTS_API_KEY
 */
export const ttsConfig = {
	apiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TTS_API_KEY ?? "",
	endpoint: "https://texttospeech.googleapis.com/v1/text:synthesize",
} as const;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface TTSRequest {
	/** Text to synthesize */
	text: string;
	/** Voice ID to use */
	voiceId: VoiceId;
	/** Normalize Malaysian abbreviations before synth */
	normalizeText?: boolean;
	/** Speaking rate (0.25 to 4.0, default 1.0) */
	speakingRate?: number;
	/** Pitch adjustment (-20.0 to 20.0, default 0) */
	pitch?: number;
}

export interface TTSResponse {
	success: boolean;
	/** Base64 encoded MP3 audio */
	audioContent?: string;
	error?: string;
	errorCode?:
		| "MISSING_API_KEY"
		| "INVALID_REQUEST"
		| "API_ERROR"
		| "NETWORK_ERROR";
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Check if TTS is properly configured.
 */
export function isConfigured(): boolean {
	return Boolean(ttsConfig.apiKey);
}

/**
 * Synthesize speech from text using Google Cloud TTS.
 *
 * @param request - Speech synthesis parameters
 * @returns Response with base64 audio or error details
 *
 * @example
 * ```ts
 * const result = await synthesizeSpeech({
 *   text: "Welcome, Dato' Ahmad",
 *   voiceId: "ms-MY-Wavenet-A",
 * });
 *
 * if (result.success && result.audioContent) {
 *   await playBase64Audio(result.audioContent);
 * }
 * ```
 */
export async function synthesizeSpeech(
	request: TTSRequest,
): Promise<TTSResponse> {
	const {
		text,
		voiceId,
		normalizeText = true,
		speakingRate = 1.0,
		pitch = 0,
	} = request;

	if (!ttsConfig.apiKey) {
		return {
			success: false,
			error:
				"Google Cloud TTS API key not configured. Set NEXT_PUBLIC_GOOGLE_CLOUD_TTS_API_KEY.",
			errorCode: "MISSING_API_KEY",
		};
	}

	// Validate text
	const trimmedText = text.trim();
	if (!trimmedText) {
		return {
			success: false,
			error: "Text cannot be empty",
			errorCode: "INVALID_REQUEST",
		};
	}

	const normalizedText = prepareTtsText(trimmedText, normalizeText);

	try {
		const response = await fetch(
			`${ttsConfig.endpoint}?key=${ttsConfig.apiKey}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					input: { text: normalizedText },
					voice: {
						languageCode: getLanguageCode(voiceId),
						name: voiceId,
					},
					audioConfig: {
						audioEncoding: "MP3",
						speakingRate: clamp(speakingRate, 0.5, 1.5),
						pitch: clamp(pitch, -10, 10),
					},
				}),
			},
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				error: parseApiError(response.status, errorData),
				errorCode: "API_ERROR",
			};
		}

		const data = await response.json();

		return {
			success: true,
			audioContent: data.audioContent,
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Network error occurred",
			errorCode: "NETWORK_ERROR",
		};
	}
}

/**
 * Play base64 encoded MP3 audio.
 *
 * @param base64Audio - Base64 encoded audio from synthesizeSpeech
 * @returns Promise that resolves when playback completes
 */
export function playBase64Audio(base64Audio: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);

		audio.onended = () => resolve();
		audio.onerror = () => reject(new Error("Audio playback failed"));
		audio.play().catch(reject);
	});
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Parse Google Cloud API error into user-friendly message.
 */
function parseApiError(
	status: number,
	errorData: { error?: { message?: string } },
): string {
	const apiMessage = errorData.error?.message;

	switch (status) {
		case 400:
			return apiMessage ?? "Invalid request format";
		case 401:
			return "Invalid API key. Please check your Google Cloud credentials.";
		case 403:
			return "API access denied. Ensure Text-to-Speech API is enabled and quota is available.";
		case 429:
			return "Rate limit exceeded. Please wait and try again.";
		case 503:
			return "Google Cloud TTS temporarily unavailable. Please try again later.";
		default:
			return apiMessage ?? `API error (${status})`;
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
