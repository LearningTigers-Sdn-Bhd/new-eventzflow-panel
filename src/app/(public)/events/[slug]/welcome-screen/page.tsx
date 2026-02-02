"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Volume2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { WelcomeScreenView } from "@/components/welcome-screen/welcome-screen-view";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useWelcomeScreenChannel } from "@/hooks/use-welcome-screen-channel";
import { fetchPublicCheckInDisplay } from "@/lib/api/check-in-display";
import { DEFAULT_FONT, getGoogleFontsUrl } from "@/lib/fonts";

const STALE_TIME_MS = 1000 * 60 * 5;

export default function WelcomeScreenPage() {
	const params = useParams();
	const slug = params.slug as string;
	const previousCheckInRef = useRef<string | null>(null);

	const {
		data: displaySettings,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public-check-in-display", slug],
		queryFn: () => fetchPublicCheckInDisplay(slug),
		retry: 3,
		staleTime: STALE_TIME_MS,
	});

	const eventId = displaySettings?.event?.id ?? null;
	const { latestCheckIn, queueSize, isConnected } =
		useWelcomeScreenChannel(eventId);

	const { speak, requiresInteraction, enableAudio, isSupported } = useTextToSpeech({
		enabled: displaySettings?.voice_enabled ?? false,
		voiceType: displaySettings?.voice_type ?? "en-US-female",
		debug: true, // Enable to see TTS logs in console
	});

	// Speak the visitor name when a new check-in arrives
	useEffect(() => {
		if (!latestCheckIn?.name) return;
		if (latestCheckIn.name === previousCheckInRef.current) return;

		previousCheckInRef.current = latestCheckIn.name;
		speak(`Welcome, ${latestCheckIn.name}`);
	}, [latestCheckIn?.name, speak]);

	useEffect(() => {
		const title = displaySettings?.event?.title;
		document.title = title ? `Welcome Screen - ${title}` : "Welcome Screen";
	}, [displaySettings?.event?.title]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
				<div className="flex flex-col items-center gap-4 text-white">
					<Loader2 className="h-12 w-12 animate-spin" />
					<p className="text-lg">Loading welcome screen...</p>
				</div>
			</div>
		);
	}

	if (error || !displaySettings) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
				<div className="max-w-md text-center text-white">
					<h1 className="mb-4 font-bold text-4xl">Welcome Screen</h1>
					<p className="text-lg opacity-80">
						{error instanceof Error
							? error.message
							: "Unable to load welcome screen settings. Please check the event configuration."}
					</p>
				</div>
			</div>
		);
	}

	// Handle click anywhere on screen to enable audio
	const handleScreenClick = () => {
		if (displaySettings?.voice_enabled && isSupported && requiresInteraction) {
			enableAudio();
		}
	};

	const showAudioPrompt = displaySettings.voice_enabled && isSupported && requiresInteraction;

	return (
		<div onClick={handleScreenClick} className={requiresInteraction ? "cursor-pointer" : ""}>
			{/* eslint-disable-next-line @next/next/no-page-custom-font */}
			<link rel="stylesheet" href={getGoogleFontsUrl()} />

			{/* Full-screen audio enable overlay */}
			{showAudioPrompt && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
					<div className="flex flex-col items-center gap-4 text-white animate-pulse">
						<Volume2 className="h-16 w-16" />
						<p className="text-2xl font-semibold">Tap anywhere to enable audio</p>
					</div>
				</div>
			)}

			<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
				{queueSize > 0 && (
					<div className="rounded-full bg-black/50 px-2 py-1 text-white text-xs">
						{queueSize} pending
					</div>
				)}
				<div
					className={`h-3 w-3 rounded-full ${
						isConnected ? "bg-green-500" : "bg-red-500"
					}`}
					title={isConnected ? "Connected" : "Disconnected"}
				/>
			</div>

			<WelcomeScreenView
				eventTitle={displaySettings.event.title}
				latestCheckIn={latestCheckIn}
				fontFamily={displaySettings.font_family || DEFAULT_FONT}
				fontSize={displaySettings.font_size || 72}
				animationType={displaySettings.animation_type || "fade_in"}
				isBold={displaySettings.is_bold || false}
				nameColor={displaySettings.name_color || "#FFFFFF"}
				backgroundImageUrl={displaySettings.background_image_url}
			/>
		</div>
	);
}
