"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { WelcomeScreenView } from "@/components/welcome-screen/welcome-screen-view";
import { DEFAULT_VOICE, type VoiceId, useTTS } from "@/hooks/use-tts";
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

	// Text-to-speech for welcome announcements
	const { speak, error: ttsError } = useTTS({
		enabled: displaySettings?.voice_enabled ?? false,
		voiceId: (displaySettings?.voice_type as VoiceId) || DEFAULT_VOICE,
	});

	// Announce visitor name on new check-in
	useEffect(() => {
		if (!latestCheckIn?.name) return;
		if (latestCheckIn.name === previousCheckInRef.current) return;

		previousCheckInRef.current = latestCheckIn.name;
		const welcomeText = displaySettings?.welcome_text || "Welcome";
		speak(`${welcomeText}, ${latestCheckIn.name}`);
	}, [latestCheckIn?.name, speak]);

	// Update page title
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

	return (
		<div>
			{/* eslint-disable-next-line @next/next/no-page-custom-font */}
			<link rel="stylesheet" href={getGoogleFontsUrl()} />

			{/* Status indicators */}
			<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
				{ttsError && (
					<div className="rounded-full bg-red-500/80 px-2 py-1 text-white text-xs">
						Voice error
					</div>
				)}
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
				welcomeText={displaySettings.welcome_text || "Welcome"}
			/>
		</div>
	);
}
