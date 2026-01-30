"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseTextToSpeechOptions {
	enabled: boolean;
	voiceType: string; // Format: "lang-gender" e.g., "en-US-female"
}

interface UseTextToSpeechReturn {
	speak: (text: string) => void;
	isSpeaking: boolean;
	isSupported: boolean;
	requiresInteraction: boolean;
	enableAudio: () => void;
}

/**
 * Hook for text-to-speech using Web Speech API
 * Handles voice selection, queuing, and browser compatibility
 */
export function useTextToSpeech({
	enabled,
	voiceType,
}: UseTextToSpeechOptions): UseTextToSpeechReturn {
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const [requiresInteraction, setRequiresInteraction] = useState(false);
	const [audioEnabled, setAudioEnabled] = useState(false);
	const [voicesReady, setVoicesReady] = useState(false);
	const queueRef = useRef<string[]>([]);
	const isSpeakingRef = useRef(false);

	// Check for Web Speech API support
	useEffect(() => {
		const supported = typeof window !== "undefined" && "speechSynthesis" in window;
		setIsSupported(supported);

		// Safari requires user interaction before speech works
		if (supported) {
			const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
			setRequiresInteraction(isSafari && !audioEnabled);

			// Check if voices are already available (Firefox/Edge load sync)
			const voices = window.speechSynthesis.getVoices();
			if (voices.length > 0) {
				setVoicesReady(true);
			}
		}
	}, [audioEnabled]);

	// Find the best matching voice for the selected voice type (lang-gender)
	const getVoice = useCallback((): SpeechSynthesisVoice | null => {
		if (!isSupported) return null;

		const voices = window.speechSynthesis.getVoices();
		if (voices.length === 0) return null;

		// Parse voiceType: "en-US-female" -> lang="en-US", gender="female"
		const parts = voiceType.split("-");
		const gender = parts.pop() || "female"; // last part is gender
		const lang = parts.join("-"); // remaining is language code

		// Gender patterns for voice name matching
		// Note: Check female first to avoid "female" matching "male" pattern
		// Includes common voice names across browsers/platforms:
		// - Chrome/Edge/Brave: Google voices
		// - Safari: Apple voices
		// - Firefox Windows: Microsoft voices
		// - Firefox Mac: Apple voices
		const femalePatterns = /female|woman|zira|samantha|karen|susan|victoria|fiona|moira|tessa|amelie|anna|helena|laura|maria|nicky|paulina|ting|mei|yuna|kyoko|lekha|veena|damayanti|siti|monica|conchita|lucia|penelope|celine|aurelie|o-ren|kyoko|yuna|sora|seoyeon|sunhi|hazel|heera|haruka|sayaka|mizuki/i;
		const malePatterns = /\bmale\b|man|david|daniel|alex|james|george|thomas|oliver|fred|jorge|diego|luca|yuri|ichiro|rishi|adam|enrique|pablo|carlos|mathieu|thomas|otoya|junwoo|mark|richard|sean|tom/i;

		const isFemale = gender === "female";

		// Helper function to check if voice matches gender
		const matchesGender = (voiceName: string, wantFemale: boolean): boolean => {
			// Always check female patterns first to avoid "female" matching "\bmale\b"
			const isFemaleVoice = femalePatterns.test(voiceName);
			if (wantFemale) return isFemaleVoice;
			// For male: must match male pattern AND not match female pattern
			return malePatterns.test(voiceName) && !isFemaleVoice;
		};

		// Priority 1: Exact language match AND gender (e.g., en-US or en-GB specifically)
		const exactLangMatch = voices.find(
			(v) => v.lang === lang && matchesGender(v.name, isFemale)
		);
		if (exactLangMatch) return exactLangMatch;

		// Priority 2: Exact language match, any gender
		const exactLangAnyGender = voices.find((v) => v.lang === lang);
		if (exactLangAnyGender) return exactLangAnyGender;

		// Priority 3: Language prefix match AND gender (e.g., any "en" voice)
		const langPrefix = lang.split("-")[0];
		const prefixMatch = voices.find(
			(v) => v.lang.startsWith(langPrefix) && matchesGender(v.name, isFemale)
		);
		if (prefixMatch) return prefixMatch;

		// Priority 4: Match gender with any English voice
		const englishGenderMatch = voices.find(
			(v) => v.lang.startsWith("en") && matchesGender(v.name, isFemale)
		);
		if (englishGenderMatch) return englishGenderMatch;

		// Priority 5: Any voice in same language prefix
		const langMatch = voices.find((v) => v.lang.startsWith(langPrefix));
		if (langMatch) return langMatch;

		// Priority 6: Any English voice
		const englishVoice = voices.find((v) => v.lang.startsWith("en"));
		if (englishVoice) return englishVoice;

		// Final fallback
		return voices[0];
	}, [isSupported, voiceType]);

	// Process the speech queue
	const processQueue = useCallback(() => {
		if (!isSupported || !enabled || isSpeakingRef.current) return;
		if (queueRef.current.length === 0) return;
		if (requiresInteraction && !audioEnabled) return;
		// Wait for voices to be loaded (Safari/Chrome load async)
		if (!voicesReady) return;

		const text = queueRef.current.shift();
		if (!text) return;

		isSpeakingRef.current = true;
		setIsSpeaking(true);

		const synth = window.speechSynthesis;

		// Cancel any pending speech - required for Safari to reset state
		synth.cancel();

		// Parse language from voiceType
		const parts = voiceType.split("-");
		parts.pop(); // remove gender
		const lang = parts.join("-") || "en-US";

		const utterance = new SpeechSynthesisUtterance(text);
		const voice = getVoice();
		if (voice) {
			utterance.voice = voice;
			utterance.lang = voice.lang;
		} else {
			utterance.lang = lang;
		}

		// Safari 15+ fix: keep speech alive for longer utterances
		// Without this, Safari stops speaking after ~15 seconds
		let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

		utterance.onstart = () => {
			keepAliveInterval = setInterval(() => {
				if (!synth.speaking) {
					if (keepAliveInterval) clearInterval(keepAliveInterval);
				} else {
					synth.pause();
					synth.resume();
				}
			}, 10000);
		};

		utterance.onend = () => {
			if (keepAliveInterval) clearInterval(keepAliveInterval);
			isSpeakingRef.current = false;
			setIsSpeaking(false);
			// Process next item in queue
			processQueue();
		};

		utterance.onerror = () => {
			if (keepAliveInterval) clearInterval(keepAliveInterval);
			isSpeakingRef.current = false;
			setIsSpeaking(false);
			// Process next item in queue even on error
			processQueue();
		};

		synth.speak(utterance);
	}, [isSupported, enabled, getVoice, requiresInteraction, audioEnabled, voicesReady]);

	// Speak function - adds to queue
	const speak = useCallback(
		(text: string) => {
			if (!isSupported || !enabled) return;
			if (requiresInteraction && !audioEnabled) return;

			queueRef.current.push(text);
			processQueue();
		},
		[isSupported, enabled, processQueue, requiresInteraction, audioEnabled],
	);

	// Enable audio after user interaction (for Safari)
	const enableAudio = useCallback(() => {
		setAudioEnabled(true);
		setRequiresInteraction(false);

		// Trigger voices to load and check if already available
		if (isSupported) {
			const voices = window.speechSynthesis.getVoices();
			if (voices.length > 0) {
				setVoicesReady(true);
			}
		}
	}, [isSupported]);

	// Load voices when they become available (Safari/Chrome load async)
	useEffect(() => {
		if (!isSupported) return;

		const handleVoicesChanged = () => {
			const voices = window.speechSynthesis.getVoices();
			if (voices.length > 0) {
				setVoicesReady(true);
			}
		};

		window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
		// Trigger initial load
		window.speechSynthesis.getVoices();

		return () => {
			window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
		};
	}, [isSupported]);

	// Process queue when voices become ready (handles Safari async loading)
	useEffect(() => {
		if (voicesReady && queueRef.current.length > 0) {
			processQueue();
		}
	}, [voicesReady, processQueue]);

	return {
		speak,
		isSpeaking,
		isSupported,
		requiresInteraction,
		enableAudio,
	};
}
