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
	isConfigured,
	playBase64Audio,
	synthesizeSpeech,
	type TTSRequest,
	type TTSResponse,
	ttsConfig,
} from "./tts-service";

// Voice definitions and types
export {
	DEFAULT_VOICE,
	getVoiceById,
	getVoiceLocale,
	getVoicesByCategory,
	VOICES,
	type Voice,
	type VoiceCategory,
	type VoiceId,
} from "./voices";
