"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { LuckyDrawWrapper } from "@/components/pages/surprise-mechanics/lucky-draw/session/session-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getEventById } from "@/lib/api/event";
import { getLuckyDrawSession } from "@/lib/api/lucky-draw";

interface LuckyDrawSessionPageProps {
	params: Promise<{
		event_id: string;
		session_id: string;
	}>;
}

export default function LuckyDrawSessionPage({
	params,
}: LuckyDrawSessionPageProps) {
	const { event_id, session_id } = use(params);
	const { isInitialized } = useAuth();
	const sessionId = Number.parseInt(session_id, 10);

	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
		enabled: isInitialized && !!event_id,
	});

	const { data: session, isLoading: isLoadingSession } = useQuery({
		queryKey: ["lucky-draw-session", event_id, sessionId],
		queryFn: () => getLuckyDrawSession(event_id, sessionId),
		enabled: isInitialized && !!sessionId,
	});

	if (isLoadingEvent || isLoadingSession) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Skeleton className="h-96 w-full max-w-7xl" />
			</div>
		);
	}

	if (!session) return <div>Session not found</div>;

	return (
		<LuckyDrawWrapper
			eventId={event_id}
			sessionId={sessionId}
			session={session}
			eventName={event?.title || `Event ${event_id}`}
		/>
	);
}
