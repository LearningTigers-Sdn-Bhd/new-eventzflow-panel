/**
 * Voice Configuration for Text-to-Speech
 *
 * Google Cloud WaveNet voices optimized for Malaysian event welcome screens.
 * Supports Malay, English, and Chinese names.
 */

export type VoiceCategory = "malay" | "english" | "chinese" | "cloned";
export type VoiceProvider = "google" | "elevenlabs";

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
	/** Provider for the voice */
	provider: VoiceProvider;
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
		provider: "google",
	},
	{
		id: "ms-MY-Wavenet-B",
		name: "Ahmad",
		label: "Ahmad (Malay Male)",
		gender: "male",
		locale: "ms-MY",
		category: "malay",
		provider: "google",
	},
	{
		id: "ms-MY-Wavenet-C",
		name: "Aminah",
		label: "Aminah (Malay Female)",
		gender: "female",
		locale: "ms-MY",
		category: "malay",
		provider: "google",
	},
	{
		id: "ms-MY-Wavenet-D",
		name: "Ismail",
		label: "Ismail (Malay Male)",
		gender: "male",
		locale: "ms-MY",
		category: "malay",
		provider: "google",
	},

	// ENGLISH
	{
		id: "en-US-Wavenet-F",
		name: "Emma",
		label: "Emma (US Female)",
		gender: "female",
		locale: "en-US",
		category: "english",
		provider: "google",
	},
	{
		id: "en-US-Wavenet-D",
		name: "James",
		label: "James (US Male)",
		gender: "male",
		locale: "en-US",
		category: "english",
		provider: "google",
	},
	{
		id: "en-GB-Wavenet-A",
		name: "Charlotte",
		label: "Charlotte (UK Female)",
		gender: "female",
		locale: "en-GB",
		category: "english",
		provider: "google",
	},
	{
		id: "en-GB-Wavenet-B",
		name: "Oliver",
		label: "Oliver (UK Male)",
		gender: "male",
		locale: "en-GB",
		category: "english",
		provider: "google",
	},

	// CHINESE (Mandarin)
	{
		id: "cmn-CN-Wavenet-A",
		name: "Xiaomei",
		label: "Xiaomei (Chinese Female)",
		gender: "female",
		locale: "cmn-CN",
		category: "chinese",
		provider: "google",
	},
	{
		id: "cmn-CN-Wavenet-B",
		name: "Wei",
		label: "Wei (Chinese Male)",
		gender: "male",
		locale: "cmn-CN",
		category: "chinese",
		provider: "google",
	},
] as const satisfies readonly Voice[];

export type VoiceId = (typeof VOICES)[number]["id"] | string;

export const DEFAULT_VOICE: VoiceId = "ms-MY-Wavenet-A";

export function getVoicesByCategory(): Record<VoiceCategory, Voice[]> {
	return {
		malay: VOICES.filter((voice) => voice.category === "malay"),
		english: VOICES.filter((voice) => voice.category === "english"),
		chinese: VOICES.filter((voice) => voice.category === "chinese"),
	};
}

export function getVoiceById(voiceId: string): Voice | undefined {
	const voice = VOICES.find((v) => v.id === voiceId);
	if (voice) return voice;

	// If it looks like an ElevenLabs ID (premium), return a minimal Voice object
	// Standard IDs in this app start with 'ms-MY-', 'en-US-', etc.
	const isStandard = voiceId.includes("-") && (
		voiceId.startsWith("ms-") || 
		voiceId.startsWith("en-") || 
		voiceId.startsWith("cmn-") ||
		voiceId.startsWith("ja-") ||
		voiceId.startsWith("ko-")
	);

	if (voiceId && !isStandard) {
		return {
			id: voiceId,
			name: "Premium Voice",
			label: "Premium Voice",
			gender: "female", // Default assumption
			locale: "en-US",
			category: "cloned",
			provider: "elevenlabs",
		};
	}

	return undefined;
}

export function getVoiceLocale(voiceId: string): string {
	return getVoiceById(voiceId)?.locale ?? "en-US";
}
