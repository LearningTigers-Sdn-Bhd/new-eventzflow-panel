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
	debug?: boolean;
}

interface UseTTSReturn {
	speak: (text: string) => Promise<void>;
	isSpeaking: boolean;
	isSupported: boolean;
	error: string | null;
	clearError: () => void;
}

export function useTTS({
	enabled,
	voiceId,
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
		async (text: string) => {
			if (!enabled || !isSupported) {
				return;
			}

			const trimmedText = text.trim();
			if (!trimmedText) {
				return;
			}

			setIsSpeaking(true);
			setError(null);

			try {
				const result = await synthesizeSpeech({ text: trimmedText, voiceId });

				if (!result.success || !result.audioContent) {
					throw new Error(result.error ?? "Speech synthesis failed");
				}

				await playBase64Audio(result.audioContent);
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
		[enabled, isSupported, log, voiceId],
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
