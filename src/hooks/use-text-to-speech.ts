"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseTextToSpeechOptions {
	enabled: boolean;
	voiceType: string; // Format: "lang-gender" e.g., "en-US-female"
	debug?: boolean; // Enable console logging for debugging
}

interface UseTextToSpeechReturn {
	speak: (text: string) => void;
	isSpeaking: boolean;
	isSupported: boolean;
	requiresInteraction: boolean;
	enableAudio: () => void;
}

// Browser detection utilities
const getBrowserInfo = () => {
	if (typeof window === "undefined") return { isSafari: false, isChrome: false, isEdge: false, isFirefox: false };

	const ua = navigator.userAgent;
	return {
		isSafari: /^((?!chrome|android).)*safari/i.test(ua),
		isChrome: /chrome/i.test(ua) && !/edge|edg/i.test(ua),
		isEdge: /edge|edg/i.test(ua),
		isFirefox: /firefox/i.test(ua),
		isWindows: /windows/i.test(ua),
	};
};

/**
 * Hook for text-to-speech using Web Speech API
 * Optimized for Safari, Chrome Windows, and Edge compatibility
 */
export function useTextToSpeech({
	enabled,
	voiceType,
	debug = false,
}: UseTextToSpeechOptions): UseTextToSpeechReturn {
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const [requiresInteraction, setRequiresInteraction] = useState(false);
	const [audioEnabled, setAudioEnabled] = useState(false);
	const [voicesReady, setVoicesReady] = useState(false);

	const queueRef = useRef<string[]>([]);
	const isSpeakingRef = useRef(false);
	const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
	const retryCountRef = useRef(0);
	const browserInfoRef = useRef(getBrowserInfo());

	const log = useCallback((...args: unknown[]) => {
		if (debug) {
			console.log("[TTS]", ...args);
		}
	}, [debug]);

	// Check for Web Speech API support and browser requirements
	useEffect(() => {
		const supported = typeof window !== "undefined" && "speechSynthesis" in window;
		setIsSupported(supported);

		if (supported) {
			const { isSafari } = browserInfoRef.current;
			// Safari and iOS require user interaction before speech works
			const needsInteraction = isSafari && !audioEnabled;
			setRequiresInteraction(needsInteraction);
			log("Browser info:", browserInfoRef.current, "Needs interaction:", needsInteraction);
		}
	}, [audioEnabled, log]);

	// Load voices with polling fallback for Windows/Edge
	useEffect(() => {
		if (!isSupported) return;

		const loadVoices = () => {
			const voices = window.speechSynthesis.getVoices();
			if (voices.length > 0) {
				voicesRef.current = voices;
				setVoicesReady(true);
				log("Voices loaded:", voices.length, voices.map(v => `${v.name} (${v.lang})`));
				return true;
			}
			return false;
		};

		// Try to load voices immediately
		if (loadVoices()) return;

		// Listen for voiceschanged event
		const handleVoicesChanged = () => {
			loadVoices();
		};
		window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

		// Polling fallback for browsers that don't fire voiceschanged reliably (Windows Chrome/Edge)
		// This is necessary because Windows often doesn't fire the event
		let pollCount = 0;
		const maxPolls = 50; // Try for up to 5 seconds
		const pollInterval = setInterval(() => {
			pollCount++;
			if (loadVoices() || pollCount >= maxPolls) {
				clearInterval(pollInterval);
				if (pollCount >= maxPolls && voicesRef.current.length === 0) {
					log("Warning: Could not load voices after polling");
				}
			}
		}, 100);

		return () => {
			window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
			clearInterval(pollInterval);
		};
	}, [isSupported, log]);

	// Find the best matching voice for the selected voice type
	const getVoice = useCallback((): SpeechSynthesisVoice | null => {
		const voices = voicesRef.current;
		if (voices.length === 0) return null;

		// Parse voiceType: "en-US-female" -> lang="en-US", gender="female"
		const parts = voiceType.split("-");
		const gender = parts.pop() || "female";
		const lang = parts.join("-");
		const langPrefix = lang.split("-")[0];
		const isFemale = gender === "female";

		// Extended patterns for better Windows/Edge voice matching
		// Windows voices: "Microsoft David - English (United States)", "Microsoft Zira Desktop"
		// Chrome voices: "Google US English", "Google UK English Female"
		// Safari voices: "Samantha", "Daniel"
		const femalePatterns = /female|woman|zira|eva|hazel|susan|linda|catherine|heather|samantha|karen|victoria|fiona|moira|tessa|amelie|anna|helena|laura|maria|nicky|paulina|ting|mei|yuna|kyoko|lekha|veena|damayanti|siti|monica|conchita|lucia|penelope|celine|aurelie|sora|seoyeon|sunhi|heera|haruka|sayaka|mizuki|google.*female/i;

		const malePatterns = /\bmale\b|man|david|mark|george|richard|james|john|michael|robert|william|daniel|alex|thomas|oliver|fred|jorge|diego|luca|yuri|ichiro|rishi|adam|enrique|pablo|carlos|mathieu|otoya|junwoo|sean|tom|google.*male/i;

		const matchesGender = (voiceName: string, wantFemale: boolean): boolean => {
			const isFemaleVoice = femalePatterns.test(voiceName);
			const isMaleVoice = malePatterns.test(voiceName) && !isFemaleVoice;

			if (wantFemale) return isFemaleVoice;
			return isMaleVoice;
		};

		// Priority 1: Exact language + gender match
		let match = voices.find(v => v.lang === lang && matchesGender(v.name, isFemale));
		if (match) { log("Voice match (exact lang + gender):", match.name); return match; }

		// Priority 2: Exact language, any gender
		match = voices.find(v => v.lang === lang);
		if (match) { log("Voice match (exact lang):", match.name); return match; }

		// Priority 3: Language prefix + gender (e.g., any "en" voice)
		match = voices.find(v => v.lang.startsWith(langPrefix) && matchesGender(v.name, isFemale));
		if (match) { log("Voice match (prefix + gender):", match.name); return match; }

		// Priority 4: Language prefix, any gender
		match = voices.find(v => v.lang.startsWith(langPrefix));
		if (match) { log("Voice match (prefix):", match.name); return match; }

		// Priority 5: Any English voice with matching gender
		match = voices.find(v => v.lang.startsWith("en") && matchesGender(v.name, isFemale));
		if (match) { log("Voice match (English + gender):", match.name); return match; }

		// Priority 6: Any English voice
		match = voices.find(v => v.lang.startsWith("en"));
		if (match) { log("Voice match (English):", match.name); return match; }

		// Final fallback: first available voice
		log("Voice match (fallback):", voices[0]?.name);
		return voices[0] || null;
	}, [voiceType, log]);

	// Process the speech queue
	const processQueue = useCallback(() => {
		if (!isSupported || !enabled || isSpeakingRef.current) return;
		if (queueRef.current.length === 0) return;
		if (requiresInteraction && !audioEnabled) {
			log("Waiting for user interaction (Safari)");
			return;
		}

		const synth = window.speechSynthesis;

		// Chrome bug workaround: Chrome sometimes gets stuck, cancel to reset
		if (synth.paused) {
			log("Synth was paused, resuming...");
			synth.resume();
		}

		// Wait for voices to load
		if (!voicesReady) {
			log("Waiting for voices to load...");
			// Retry after a short delay
			setTimeout(() => processQueue(), 100);
			return;
		}

		const text = queueRef.current.shift();
		if (!text) return;

		isSpeakingRef.current = true;
		setIsSpeaking(true);
		retryCountRef.current = 0;

		const speakText = () => {
			log("Speaking:", text);

			// Cancel any pending speech first
			synth.cancel();

			// Small delay after cancel for Safari/Edge stability
			setTimeout(() => {
				const utterance = new SpeechSynthesisUtterance(text);
				const voice = getVoice();

				if (voice) {
					utterance.voice = voice;
					utterance.lang = voice.lang;
				} else {
					// Fallback language from voiceType
					const parts = voiceType.split("-");
					parts.pop();
					utterance.lang = parts.join("-") || "en-US";
				}

				// Slightly slower rate for better clarity
				utterance.rate = 0.95;
				utterance.pitch = 1;
				utterance.volume = 1;

				let hasStarted = false;
				let keepAliveInterval: ReturnType<typeof setInterval> | null = null;
				let timeoutId: ReturnType<typeof setTimeout> | null = null;

				// Timeout to detect if speech never starts (silent failure)
				timeoutId = setTimeout(() => {
					if (!hasStarted) {
						log("Speech did not start, retrying...");
						synth.cancel();

						if (retryCountRef.current < 3) {
							retryCountRef.current++;
							// Re-queue the text and try again
							queueRef.current.unshift(text);
							isSpeakingRef.current = false;
							setTimeout(() => processQueue(), 200);
						} else {
							log("Max retries reached, giving up");
							isSpeakingRef.current = false;
							setIsSpeaking(false);
							processQueue();
						}
					}
				}, 2000);

				utterance.onstart = () => {
					hasStarted = true;
					if (timeoutId) clearTimeout(timeoutId);
					log("Speech started");

					// Safari 15+ fix: keep speech alive for longer utterances
					// Also helps with Chrome Windows stability
					keepAliveInterval = setInterval(() => {
						if (!synth.speaking) {
							if (keepAliveInterval) clearInterval(keepAliveInterval);
						} else {
							// Pause/resume trick keeps speech alive
							synth.pause();
							synth.resume();
						}
					}, 5000); // More frequent than before for better stability
				};

				utterance.onend = () => {
					log("Speech ended");
					if (keepAliveInterval) clearInterval(keepAliveInterval);
					if (timeoutId) clearTimeout(timeoutId);
					isSpeakingRef.current = false;
					setIsSpeaking(false);
					retryCountRef.current = 0;
					// Process next item in queue
					setTimeout(() => processQueue(), 100);
				};

				utterance.onerror = (event) => {
					log("Speech error:", event.error);
					if (keepAliveInterval) clearInterval(keepAliveInterval);
					if (timeoutId) clearTimeout(timeoutId);

					// Retry on certain errors
					if (event.error === "interrupted" || event.error === "canceled") {
						// These are expected when canceling, don't retry
						isSpeakingRef.current = false;
						setIsSpeaking(false);
						processQueue();
					} else if (retryCountRef.current < 3) {
						retryCountRef.current++;
						log("Retrying after error, attempt:", retryCountRef.current);
						queueRef.current.unshift(text);
						isSpeakingRef.current = false;
						setTimeout(() => processQueue(), 300);
					} else {
						log("Max retries reached after error");
						isSpeakingRef.current = false;
						setIsSpeaking(false);
						processQueue();
					}
				};

				synth.speak(utterance);

				// Edge/Chrome Windows workaround: sometimes speak() doesn't trigger
				// Check if speech is pending and give it a nudge
				setTimeout(() => {
					if (synth.pending && !synth.speaking) {
						log("Speech pending but not starting, giving nudge...");
						synth.pause();
						synth.resume();
					}
				}, 100);

			}, 50); // Small delay after cancel
		};

		speakText();
	}, [isSupported, enabled, getVoice, requiresInteraction, audioEnabled, voicesReady, voiceType, log]);

	// Speak function - adds to queue
	const speak = useCallback(
		(text: string) => {
			if (!isSupported || !enabled) {
				log("TTS not supported or disabled");
				return;
			}
			if (requiresInteraction && !audioEnabled) {
				log("Requires user interaction first (Safari)");
				return;
			}

			log("Queueing text:", text);
			queueRef.current.push(text);
			processQueue();
		},
		[isSupported, enabled, processQueue, requiresInteraction, audioEnabled, log],
	);

	// Enable audio after user interaction (required for Safari/iOS)
	const enableAudio = useCallback(() => {
		log("Enabling audio (user interaction)");
		setAudioEnabled(true);
		setRequiresInteraction(false);

		if (isSupported) {
			const synth = window.speechSynthesis;

			// Safari requires an actual utterance to be spoken after user interaction
			// to "unlock" the audio context. We speak an empty/silent utterance.
			const silentUtterance = new SpeechSynthesisUtterance("");
			silentUtterance.volume = 0;
			synth.speak(silentUtterance);

			// Also trigger voice loading
			const voices = synth.getVoices();
			if (voices.length > 0) {
				voicesRef.current = voices;
				setVoicesReady(true);
			}

			// Process any queued items after a short delay
			setTimeout(() => {
				if (queueRef.current.length > 0) {
					processQueue();
				}
			}, 100);
		}
	}, [isSupported, processQueue, log]);

	// Process queue when voices become ready
	useEffect(() => {
		if (voicesReady && queueRef.current.length > 0) {
			processQueue();
		}
	}, [voicesReady, processQueue]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (typeof window !== "undefined" && "speechSynthesis" in window) {
				window.speechSynthesis.cancel();
			}
		};
	}, []);

	return {
		speak,
		isSpeaking,
		isSupported,
		requiresInteraction,
		enableAudio,
	};
}
