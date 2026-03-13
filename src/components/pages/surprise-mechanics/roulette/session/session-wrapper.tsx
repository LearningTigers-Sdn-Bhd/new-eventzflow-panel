"use client";

import { cn } from "@/lib/utils";
import type { RouletteSession } from "@/lib/api/roulette/response";
import { RouletteDrawArea } from "./components/roulette-draw-area";
import { RouletteHeader } from "./components/roulette-header";
import { RouletteSessionProvider, useRouletteSession } from "./session-provider";

interface SessionWrapperProps {
	eventId: string;
	sessionId: number;
	session: RouletteSession;
	eventName: string;
}

function RouletteContent() {
	const { isFullscreen } = useRouletteSession();

	return (
		<div className={cn(
			"mx-auto flex min-h-screen w-full flex-col gap-6 transition-all duration-300",
			isFullscreen ? "max-w-none gap-0 p-0" : "max-w-7xl"
		)}>
			{!isFullscreen && <RouletteHeader />}
			<RouletteDrawArea />
		</div>
	);
}

export function SessionWrapper({
	eventId,
	sessionId,
	session,
	eventName,
}: SessionWrapperProps) {
	return (
		<RouletteSessionProvider
			eventId={eventId}
			sessionId={sessionId}
			session={session}
			eventName={eventName}
		>
			<RouletteContent />
		</RouletteSessionProvider>
	);
}
