"use client";

import { Image } from "@unpic/react";

interface SessionDrawAreaProps {
	session: {
		logo_url: string | null;
		title: string;
	};
	backgroundStyle: React.CSSProperties;
	drawComponent: React.ReactNode;
	className?: string;
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
}: SessionDrawAreaProps) {
	return (
		<div className={className} style={backgroundStyle}>
			{session.logo_url && (
			<div className="relative h-16 w-full max-w-xs">
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
