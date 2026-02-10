"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { WelcomeScreenView } from "@/components/welcome-screen/welcome-screen-view";
import { DEFAULT_VOICE, useTTS, type VoiceId } from "@/hooks/use-tts";
import { useWelcomeScreenChannel } from "@/hooks/use-welcome-screen-channel";
import { fetchPublicCheckInDisplay } from "@/lib/api/check-in-display";
import type { CheckInBroadcast } from "@/lib/api/check-in-display/types";
import { DEFAULT_FONT, getGoogleFontsUrl } from "@/lib/fonts";
import { getVoiceById } from "@/lib/tts";

const STALE_TIME_MS = 1000 * 60 * 5;
const ANNOUNCEMENT_GAP_MS = 3000;

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCheckInId(checkIn: CheckInBroadcast): string {
	return `${checkIn.checked_in_at}:${checkIn.name}`;
}

export default function WelcomeScreenPage() {
	const params = useParams();
	const slug = params.slug as string;
	const [announcementQueue, setAnnouncementQueue] = useState<
		CheckInBroadcast[]
	>([]);
	const [activeCheckIn, setActiveCheckIn] = useState<CheckInBroadcast | null>(
		null,
	);
	const [isProcessingQueue, setIsProcessingQueue] = useState(false);
	const seenAnnouncementIdsRef = useRef(new Set<string>());
	const isMountedRef = useRef(true);

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

	const resolvedVoiceId: VoiceId =
		displaySettings?.voice_type && getVoiceById(displaySettings.voice_type)
			? (displaySettings.voice_type as VoiceId)
			: DEFAULT_VOICE;

	const voiceEnabled = displaySettings?.voice_enabled ?? false;

	const { speak, error: ttsError } = useTTS({
		enabled: voiceEnabled,
		voiceId: resolvedVoiceId,
	});

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		if (!latestCheckIn || !voiceEnabled) {
			return;
		}

		const checkInId = getCheckInId(latestCheckIn);
		if (seenAnnouncementIdsRef.current.has(checkInId)) {
			return;
		}

		seenAnnouncementIdsRef.current.add(checkInId);
		setAnnouncementQueue((prevQueue) => [...prevQueue, latestCheckIn]);
	}, [latestCheckIn, voiceEnabled]);

	useEffect(() => {
		if (!voiceEnabled || isProcessingQueue || announcementQueue.length === 0) {
			return;
		}
		const nextCheckIn = announcementQueue[0];

		const processAnnouncement = async () => {
			setIsProcessingQueue(true);
			setActiveCheckIn(nextCheckIn);

			const welcomeText = displaySettings?.welcome_text || "Welcome";
			await speak(`${welcomeText}, ${nextCheckIn.name}`);
			await wait(ANNOUNCEMENT_GAP_MS);

			if (!isMountedRef.current) {
				return;
			}

			setAnnouncementQueue((prevQueue) => prevQueue.slice(1));
			setIsProcessingQueue(false);

			if (announcementQueue.length <= 1) {
				setActiveCheckIn(null);
			}
		};

		void processAnnouncement();
	}, [
		announcementQueue,
		displaySettings?.welcome_text,
		isProcessingQueue,
		speak,
		voiceEnabled,
	]);

	const checkInToDisplay = useMemo(() => {
		if (voiceEnabled) {
			return activeCheckIn;
		}

		return latestCheckIn;
	}, [activeCheckIn, latestCheckIn, voiceEnabled]);

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
				latestCheckIn={checkInToDisplay}
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
