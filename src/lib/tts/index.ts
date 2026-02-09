/**
 * TTS (Text-to-Speech) Module
 *
 * Google Cloud Text-to-Speech integration for welcome screen announcements.
 */

// Audio playback utilities
export {
	type AudioPlaybackResult,
	createAudioFromBlob,
	playAudioBlob,
} from "./audio-player";

// Google Cloud TTS service
export {
	type TTSRequest,
	type TTSResponse,
	isConfigured,
	playBase64Audio,
	synthesizeSpeech,
	ttsConfig,
} from "./tts-service";

// Voice definitions and types
export {
	DEFAULT_VOICE,
	type Voice,
	type VoiceCategory,
	type VoiceId,
	VOICES,
	getVoiceById,
	getVoiceLocale,
	getVoicesByCategory,
} from "./voices";
