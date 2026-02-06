/**
 * Voice Configuration for Text-to-Speech
 *
 * Google Cloud WaveNet voices optimized for Malaysian event welcome screens.
 * Supports Malay, English, and Chinese names.
 *
 * @see https://cloud.google.com/text-to-speech/docs/voices
 */

export type VoiceCategory = "malay" | "english" | "chinese";

export interface Voice {
	/** Voice ID used in API calls (e.g., "ms-MY-Wavenet-A") */
	id: string;
	/** Display name */
	name: string;
	/** Full label for UI display */
	label: string;
	/** Voice gender */
	gender: "male" | "female";
	/** BCP-47 locale code */
	locale: string;
	/** Category for grouping in UI */
	category: VoiceCategory;
}

/**
 * Curated list of WaveNet voices for the welcome screen.
 *
 * Priority:
 * 1. Malay (ms-MY) - Best for Malaysian names (Dato', Tan Sri, etc.)
 * 2. English - For international attendees
 * 3. Chinese - For Chinese names
 */
export const VOICES = [
	// ─────────────────────────────────────────────────────────────
	// MALAY - Best for Malaysian names
	// ─────────────────────────────────────────────────────────────
	{
		id: "ms-MY-Wavenet-A",
		name: "Siti",
		label: "Siti (Malay Female) - Recommended",
		gender: "female",
		locale: "ms-MY",
		category: "malay",
	},
	{
		id: "ms-MY-Wavenet-B",
		name: "Ahmad",
		label: "Ahmad (Malay Male)",
		gender: "male",
		locale: "ms-MY",
		category: "malay",
	},
	{
		id: "ms-MY-Wavenet-C",
		name: "Aminah",
		label: "Aminah (Malay Female)",
		gender: "female",
		locale: "ms-MY",
		category: "malay",
	},
	{
		id: "ms-MY-Wavenet-D",
		name: "Ismail",
		label: "Ismail (Malay Male)",
		gender: "male",
		locale: "ms-MY",
		category: "malay",
	},

	// ─────────────────────────────────────────────────────────────
	// ENGLISH (US & UK)
	// ─────────────────────────────────────────────────────────────
	{
		id: "en-US-Wavenet-F",
		name: "Emma",
		label: "Emma (US Female)",
		gender: "female",
		locale: "en-US",
		category: "english",
	},
	{
		id: "en-US-Wavenet-D",
		name: "James",
		label: "James (US Male)",
		gender: "male",
		locale: "en-US",
		category: "english",
	},
	{
		id: "en-GB-Wavenet-A",
		name: "Charlotte",
		label: "Charlotte (UK Female)",
		gender: "female",
		locale: "en-GB",
		category: "english",
	},
	{
		id: "en-GB-Wavenet-B",
		name: "Oliver",
		label: "Oliver (UK Male)",
		gender: "male",
		locale: "en-GB",
		category: "english",
	},

	// ─────────────────────────────────────────────────────────────
	// CHINESE (Mandarin)
	// ─────────────────────────────────────────────────────────────
	{
		id: "cmn-CN-Wavenet-A",
		name: "Xiaomei",
		label: "Xiaomei (Chinese Female)",
		gender: "female",
		locale: "cmn-CN",
		category: "chinese",
	},
	{
		id: "cmn-CN-Wavenet-B",
		name: "Wei",
		label: "Wei (Chinese Male)",
		gender: "male",
		locale: "cmn-CN",
		category: "chinese",
	},
] as const satisfies readonly Voice[];

/** Voice ID type derived from available voices */
export type VoiceId = (typeof VOICES)[number]["id"];

/** Default voice - Siti (Malay Female) for Malaysian events */
export const DEFAULT_VOICE: VoiceId = "ms-MY-Wavenet-A";

/**
 * Get voices grouped by category for UI display.
 */
export function getVoicesByCategory(): Record<VoiceCategory, Voice[]> {
	return {
		malay: VOICES.filter((v) => v.category === "malay"),
		english: VOICES.filter((v) => v.category === "english"),
		chinese: VOICES.filter((v) => v.category === "chinese"),
	};
}

/**
 * Get the locale for a voice ID.
 * @returns Locale string or "en-US" as fallback
 */
export function getVoiceLocale(voiceId: string): string {
	const voice = VOICES.find((v) => v.id === voiceId);
	return voice?.locale ?? "en-US";
}

/**
 * Get voice metadata by ID.
 */
export function getVoiceById(voiceId: string): Voice | undefined {
	return VOICES.find((v) => v.id === voiceId);
}
