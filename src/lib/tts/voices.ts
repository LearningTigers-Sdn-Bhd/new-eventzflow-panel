/**
 * Voice Configuration for Text-to-Speech
 *
 * Google Cloud WaveNet voices optimized for Malaysian event welcome screens.
 * Supports Malay, English, and Chinese names.
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
 */
export const VOICES = [
	// MALAY - Best for Malaysian names
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

	// ENGLISH
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

	// CHINESE (Mandarin)
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

export type VoiceId = (typeof VOICES)[number]["id"];

export const DEFAULT_VOICE: VoiceId = "ms-MY-Wavenet-A";

export function getVoicesByCategory(): Record<VoiceCategory, Voice[]> {
	return {
		malay: VOICES.filter((voice) => voice.category === "malay"),
		english: VOICES.filter((voice) => voice.category === "english"),
		chinese: VOICES.filter((voice) => voice.category === "chinese"),
	};
}

export function getVoiceById(voiceId: string): Voice | undefined {
	return VOICES.find((voice) => voice.id === voiceId);
}

export function getVoiceLocale(voiceId: string): string {
	return getVoiceById(voiceId)?.locale ?? "en-US";
}
