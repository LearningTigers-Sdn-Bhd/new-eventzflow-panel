"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { SessionWrapper } from "@/components/pages/surprise-mechanics/roulette/session/session-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventById } from "@/lib/api/event";
import { getRouletteSession } from "@/lib/api/roulette";

interface PrizeRouletteSessionPageProps {
	params: Promise<{
		event_id: string;
		session_id: string;
	}>;
}

export default function PrizeRouletteSessionPage({
	params,
}: PrizeRouletteSessionPageProps) {
	const { event_id, session_id } = use(params);
	const { isInitialized } = useAuth();
	const sessionId = Number.parseInt(session_id, 10);

	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
		enabled: isInitialized && !!event_id,
	});

	const { data: session, isLoading: isLoadingSession } = useQuery({
		queryKey: ["roulette-session", event_id, sessionId],
		queryFn: () => getRouletteSession(event_id, sessionId),
		enabled: isInitialized && !!event_id && !!sessionId,
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
		<SessionWrapper
			eventId={event_id}
			sessionId={sessionId}
			session={session}
			eventName={event?.title || `Event ${event_id}`}
		/>
	);
}
