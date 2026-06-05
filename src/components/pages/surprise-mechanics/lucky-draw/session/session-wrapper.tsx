"use client";

import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { cn } from "@/lib/utils";
import { LuckyDrawDrawArea } from "./components/lucky-draw-draw-area";
import { LuckyDrawHeader } from "./components/lucky-draw-header";
import {
	LuckyDrawSessionProvider,
	useLuckyDrawSession,
} from "./session-provider";

interface SessionWrapperProps {
	eventId: string;
	sessionId: number;
	session: LuckyDrawSession;
	eventName: string;
}

function LuckyDrawContent() {
	const { isFullscreen } = useLuckyDrawSession();

	return (
		<div
			className={cn(
				"mx-auto flex min-h-screen w-full flex-col gap-6 transition-all duration-300",
				isFullscreen ? "max-w-none gap-0 p-0" : "max-w-7xl",
			)}
		>
			{!isFullscreen && <LuckyDrawHeader />}
			<LuckyDrawDrawArea />
		</div>
	);
}

export function LuckyDrawWrapper({
	eventId,
	sessionId,
	session,
	eventName,
}: SessionWrapperProps) {
	return (
		<LuckyDrawSessionProvider
			eventId={eventId}
			sessionId={sessionId}
			session={session}
			eventName={eventName}
		>
			<LuckyDrawContent />
		</LuckyDrawSessionProvider>
	);
}
