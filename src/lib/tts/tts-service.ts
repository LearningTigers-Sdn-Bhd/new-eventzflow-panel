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
 * Client calls our internal API route.
 */
export const ttsConfig = {
	endpoint: "/api/tts/synthesize",
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
		| "RATE_LIMIT"
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
	return Boolean(ttsConfig.endpoint);
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
		const response = await fetch(ttsConfig.endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				text: normalizedText,
				voiceId,
				normalizeText: false,
				speakingRate: clamp(speakingRate, 0.5, 1.5),
				pitch: clamp(pitch, -10, 10),
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const errorCode = response.status === 429 ? "RATE_LIMIT" : "API_ERROR";
			return {
				success: false,
				error: parseApiError(response.status, errorData),
				errorCode,
			};
		}

		const data = await response.json();

		if (!data.success) {
			return {
				success: false,
				error: data.error ?? "Speech synthesis failed",
				errorCode: data.errorCode ?? "API_ERROR",
			};
		}

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
	return new Promise((resolve) => {
		try {
			const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);

			audio.onended = () => resolve();
			audio.onerror = () => {
				console.warn("TTS Audio element error, skipping playback");
				resolve();
			};

			const playPromise = audio.play();
			if (playPromise !== undefined) {
				playPromise.catch((error) => {
					console.warn("TTS Playback promise rejected (interrupted):", error);
					resolve(); // Resolve anyway to unblock the queue
				});
			}
		} catch (e) {
			console.error("Failed to initialize TTS Audio:", e);
			resolve();
		}
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

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
