"use client";

import type { AnimationType, CheckInBroadcast } from "@/lib/api/check-in-display/types";
import { API_BASE_URL } from "@/utils/rest-api";
import { NameAnimation } from "./name-animation";

interface WelcomeScreenViewProps {
	eventTitle: string;
	latestCheckIn: CheckInBroadcast | null;
	fontFamily: string;
	fontSize: number;
	animationType: AnimationType;
	isBold: boolean;
	nameColor: string;
	backgroundImageUrl: string | null;
	welcomeText: string;
}

/**
 * Main welcome screen display component
 * Shows event title when idle, animated attendee name on check-in
 */
export function WelcomeScreenView({
	eventTitle,
	latestCheckIn,
	fontFamily,
	fontSize,
	animationType,
	isBold,
	nameColor,
	backgroundImageUrl,
	welcomeText,
}: WelcomeScreenViewProps) {
	const displayName = latestCheckIn?.name || eventTitle;

	// Build full URL for background image (API returns relative path)
	const fullBackgroundImageUrl = backgroundImageUrl
		? `${API_BASE_URL}${backgroundImageUrl}`
		: null;

	return (
		<div
			className="relative flex min-h-screen items-center justify-center overflow-hidden"
			style={{
				backgroundColor: "#1a1a2e",
			}}
		>
			{/* Background Image */}
			{fullBackgroundImageUrl && (
				<div
					className="absolute inset-0 bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage: `url(${fullBackgroundImageUrl})`,
					}}
				>
					{/* Overlay for better text visibility */}
					<div className="absolute inset-0 bg-black/20" />
				</div>
			)}

			{/* Content */}
			<div className="relative z-10 max-w-[90vw] px-4 text-center text-black sm:px-8">
				{latestCheckIn ? (
					<>
						<p
							className="mb-2 text-sm uppercase tracking-widest opacity-80 sm:mb-4 sm:text-lg"
							style={{
								color: nameColor,
								fontWeight: isBold ? "bold" : "normal",
							}}
						>
							{welcomeText}
						</p>
						<NameAnimation
							name={displayName}
							animationType={animationType}
							fontFamily={fontFamily}
							fontSize={fontSize}
							isBold={isBold}
							nameColor={nameColor}
						/>
					</>
				) : (
					<div
						style={{
							fontFamily,
							fontSize: `${fontSize}px`,
							lineHeight: 1.2,
							fontWeight: isBold ? "bold" : "normal",
							color: nameColor,
						}}
					>
						{eventTitle}
					</div>
				)}
			</div>

			{/* Subtle gradient overlay at bottom */}
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
		</div>
	);
}
