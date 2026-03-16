"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { playBase64Audio, synthesizeSpeech, type VoiceId } from "@/lib/tts";

export {
	DEFAULT_VOICE,
	getVoicesByCategory,
	VOICES,
	type VoiceId,
} from "@/lib/tts";

interface UseTTSOptions {
	enabled: boolean;
	voiceId: VoiceId;
	eventId?: number;
	speakingRate?: number;
	debug?: boolean;
}

interface UseTTSReturn {
	speak: (text: string, overrideVoiceId?: VoiceId | VoiceId[]) => Promise<void>;
	isSpeaking: boolean;
	isSupported: boolean;
	error: string | null;
	clearError: () => void;
}

export function useTTS({
	enabled,
	voiceId: defaultVoiceId,
	eventId,
	speakingRate = 0.88,
	debug = false,
}: UseTTSOptions): UseTTSReturn {
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const isMountedRef = useRef(true);

	const log = useCallback(
		(...args: unknown[]) => {
			if (debug) {
				console.log("[TTS]", ...args);
			}
		},
		[debug],
	);

	useEffect(() => {
		const supported =
			typeof window !== "undefined" && typeof Audio !== "undefined";

		setIsSupported(supported);

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const speak = useCallback(
		async (text: string, overrideVoiceId?: VoiceId | VoiceId[]) => {
			if (!enabled || !isSupported) {
				return;
			}

			const trimmedText = text.trim();
			if (!trimmedText) {
				return;
			}

			setIsSpeaking(true);
			setError(null);

			const currentVoiceIds = overrideVoiceId 
				? (Array.isArray(overrideVoiceId) ? overrideVoiceId : [overrideVoiceId])
				: [defaultVoiceId];

			try {
				const synthesisPromises = currentVoiceIds.map(vid => 
					synthesizeSpeech({
						text: trimmedText,
						voiceId: vid,
						eventId,
						speakingRate,
					})
				);

				const results = await Promise.all(synthesisPromises);
				
				const validAudioContents = results
					.filter(r => r.success && r.audioContent)
					.map(r => r.audioContent!);

				if (validAudioContents.length === 0) {
					const firstError = results.find(r => r.error)?.error;
					throw new Error(firstError ?? "Speech synthesis failed");
				}

				// Play all synced voices together
				await Promise.all(validAudioContents.map(playBase64Audio));
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown text-to-speech error";
				log("Error:", message);

				if (isMountedRef.current) {
					setError(message);
				}
			} finally {
				if (isMountedRef.current) {
					setIsSpeaking(false);
				}
			}
		},
		[enabled, isSupported, log, speakingRate, defaultVoiceId],
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		speak,
		isSpeaking,
		isSupported,
		error,
		clearError,
	};
}
