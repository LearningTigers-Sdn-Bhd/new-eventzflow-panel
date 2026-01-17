"use client";

import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { LuckyDrawDrawArea } from "./components/lucky-draw-draw-area";
import { LuckyDrawHeader } from "./components/lucky-draw-header";
import { LuckyDrawSessionProvider } from "./session-provider";

interface SessionWrapperProps {
	eventId: string;
	sessionId: number;
	session: LuckyDrawSession;
	eventName: string;
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
			<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6">
				<LuckyDrawHeader />
				<LuckyDrawDrawArea />
			</div>
		</LuckyDrawSessionProvider>
	);
}
