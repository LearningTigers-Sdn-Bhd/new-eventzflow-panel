"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getPublicEventById,
	type PublicEventInfo,
} from "@/lib/api/event/endpoints";
import ReservationSessionLayout from "./reservation-session-layout";
import { usePublicSeatStore } from "./stores/public-seat-store";

const STALE_TIME_MS = 1000 * 60 * 5;

interface ReservationSessionClientProps {
	initialEvent: PublicEventInfo | null;
	eventSlug: string;
}

export default function ReservationSessionClient({
	initialEvent,
	eventSlug,
}: ReservationSessionClientProps) {
	const session = usePublicSeatStore((state) => state.session);

	const { data: event } = useQuery({
		queryKey: ["public-event", eventSlug],
		queryFn: () => getPublicEventById(eventSlug ?? ""),
		initialData: initialEvent,
		enabled: Boolean(eventSlug),
		retry: 2,
		staleTime: STALE_TIME_MS,
	});

	if (!session) return null;

	return (
		<ReservationSessionLayout
			session={session}
			eventTitle={event?.title ?? null}
			eventSlug={eventSlug ?? null}
		/>
	);
}
