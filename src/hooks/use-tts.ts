"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
	type VoiceId,
	isConfigured,
	playBase64Audio,
	synthesizeSpeech,
} from "@/lib/tts";

// Re-export for convenience
export {
	DEFAULT_VOICE,
	type VoiceId,
	VOICES,
	getVoicesByCategory,
} from "@/lib/tts";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface UseTTSOptions {
	/** Whether TTS is enabled */
	enabled: boolean;
	/** Voice ID to use for speech synthesis */
	voiceId: VoiceId;
	/** Enable debug logging to console */
	debug?: boolean;
}

interface UseTTSReturn {
	/** Queue text to be spoken */
	speak: (text: string) => void;
	/** Whether audio is currently playing */
	isSpeaking: boolean;
	/** Whether TTS is properly configured */
	isSupported: boolean;
	/** Current error message, if any */
	error: string | null;
	/** Clear the current error */
	clearError: () => void;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * React hook for text-to-speech using Google Cloud TTS.
 *
 * Features:
 * - Queue-based speech processing (handles rapid check-ins)
 * - Automatic cleanup on unmount
 * - Error handling with user-friendly messages
 *
 * @example
 * ```tsx
 * const { speak, isSpeaking, error } = useTTS({
 *   enabled: true,
 *   voiceId: "ms-MY-Wavenet-A",
 * });
 *
 * // Announce a check-in
 * speak("Welcome, Dato' Ahmad bin Ismail");
 * ```
 */
export function useTTS({
	enabled,
	voiceId,
	debug = false,
}: UseTTSOptions): UseTTSReturn {
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Queue management refs
	const queueRef = useRef<string[]>([]);
	const isProcessingRef = useRef(false);
	const isMountedRef = useRef(true);

	// Debug logger
	const log = useCallback(
		(...args: unknown[]) => {
			if (debug) {
				console.log("[TTS]", ...args);
			}
		},
		[debug],
	);

	// Check browser support and configuration on mount
	useEffect(() => {
		const supported =
			typeof window !== "undefined" &&
			typeof Audio !== "undefined" &&
			isConfigured();

		setIsSupported(supported);

		if (!isConfigured() && enabled) {
			log("Warning: TTS not configured. Set NEXT_PUBLIC_GOOGLE_CLOUD_TTS_API_KEY");
		}

		return () => {
			isMountedRef.current = false;
		};
	}, [enabled, log]);

	// Process speech queue
	const processQueue = useCallback(async () => {
		if (!isSupported || !enabled || isProcessingRef.current) {
			return;
		}

		if (queueRef.current.length === 0) {
			return;
		}

		const text = queueRef.current.shift();
		if (!text) {
			return;
		}

		isProcessingRef.current = true;
		setIsSpeaking(true);
		setError(null);

		log("Processing:", text);

		try {
			const result = await synthesizeSpeech({ text, voiceId });

			if (!result.success || !result.audioContent) {
				throw new Error(result.error ?? "Speech synthesis failed");
			}

			log("Playing audio...");
			await playBase64Audio(result.audioContent);
			log("Playback complete");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			log("Error:", message);

			if (isMountedRef.current) {
				setError(message);
			}
		} finally {
			isProcessingRef.current = false;

			if (isMountedRef.current) {
				setIsSpeaking(false);

				// Process next item in queue
				if (queueRef.current.length > 0) {
					setTimeout(() => processQueue(), 100);
				}
			}
		}
	}, [isSupported, enabled, voiceId, log]);

	// Public speak function
	const speak = useCallback(
		(text: string) => {
			if (!isSupported) {
				log("TTS not supported or configured");
				return;
			}

			if (!enabled) {
				log("TTS disabled");
				return;
			}

			const trimmed = text.trim();
			if (!trimmed) {
				log("Empty text, skipping");
				return;
			}

			log("Queueing:", trimmed);
			queueRef.current.push(trimmed);
			processQueue();
		},
		[isSupported, enabled, processQueue, log],
	);

	// Clear error
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			queueRef.current = [];
		};
	}, []);

	return {
		speak,
		isSpeaking,
		isSupported,
		error,
		clearError,
	};
}
