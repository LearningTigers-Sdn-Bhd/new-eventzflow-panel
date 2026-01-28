"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { WelcomeScreenView } from "@/components/welcome-screen/welcome-screen-view";
import { useWelcomeScreenChannel } from "@/hooks/use-welcome-screen-channel";
import { fetchPublicCheckInDisplay } from "@/lib/api/check-in-display";
import { DEFAULT_FONT, getGoogleFontsUrl } from "@/lib/fonts";

/**
 * Public welcome screen page for displaying check-in names
 * Fullscreen display that shows attendee names when check-ins occur
 */
export default function WelcomeScreenPage() {
	const params = useParams();
	const slug = params.slug as string;

	// Fetch display settings
	const {
		data: displaySettings,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public-check-in-display", slug],
		queryFn: () => fetchPublicCheckInDisplay(slug),
		retry: 3,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Connect to WebSocket for real-time updates
	const eventId = displaySettings?.event?.id ?? null;
	const { latestCheckIn, isConnected } = useWelcomeScreenChannel(eventId);

	// Set page title
	useEffect(() => {
		if (displaySettings?.event?.title) {
			document.title = `Welcome Screen - ${displaySettings.event.title}`;
		} else {
			document.title = "Welcome Screen";
		}
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
		<>
			{/* Load Google Fonts */}
			{/* eslint-disable-next-line @next/next/no-page-custom-font */}
			<link rel="stylesheet" href={getGoogleFontsUrl()} />

			{/* Connection status indicator */}
			<div className="fixed top-4 right-4 z-50">
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
		</>
	);
}
