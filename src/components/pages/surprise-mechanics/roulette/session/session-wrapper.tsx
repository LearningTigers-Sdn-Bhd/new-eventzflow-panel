"use client";

import type { RouletteSession } from "@/lib/api/roulette/response";
import { RouletteDrawArea } from "./components/roulette-draw-area";
import { RouletteHeader } from "./components/roulette-header";
import { RouletteSessionProvider } from "./session-provider";

interface SessionWrapperProps {
	eventId: string;
	sessionId: number;
	session: RouletteSession;
	eventName: string;
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
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6">
				<RouletteHeader />
				<RouletteDrawArea />
			</div>
		</RouletteSessionProvider>
	);
}
