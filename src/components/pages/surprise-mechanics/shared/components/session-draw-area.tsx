"use client";

import { Image } from "@unpic/react";
import { cn } from "@/lib/utils";

interface SessionDrawAreaProps {
	session: {
		logo_url: string | null;
		title: string;
	};
	backgroundStyle: React.CSSProperties;
	drawComponent: React.ReactNode;
	className?: string;
	fullscreenToggle?: React.ReactNode;
}

/**
 * Shared draw area component for both roulette and lucky-draw sessions
 * Handles background styling, logo display, and draw component rendering
 */
export function SessionDrawArea({
	session,
	backgroundStyle,
	drawComponent,
	className = "flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-10 overflow-hidden rounded-none border bg-card p-6",
	fullscreenToggle,
}: SessionDrawAreaProps) {
	// Separate background image if present
	const { backgroundImage, ...otherStyles } = backgroundStyle;

	return (
		<div className={cn("relative", className)} style={otherStyles}>
			{/* Background Image Layer */}
			{backgroundImage && (
				<div
					className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat shadow-inner"
					style={{ backgroundImage }}
				/>
			)}

			{fullscreenToggle && (
				<div className="absolute top-4 right-4 z-50">{fullscreenToggle}</div>
			)}
			{session.logo_url && (
				<div className="relative z-10 h-16 w-full max-w-xs">
					<Image
						src={session.logo_url}
						alt={session.title}
						layout="fullWidth"
						background="auto"
						className="h-full w-full object-contain"
						suppressHydrationWarning
					/>
				</div>
			)}
			<div className="z-10 flex h-full w-full flex-col items-center justify-center overflow-hidden">
				{drawComponent}
			</div>
		</div>
	);
}
