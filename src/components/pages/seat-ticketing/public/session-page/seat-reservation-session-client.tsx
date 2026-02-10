"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getPublicEventById,
	type PublicEventInfo,
} from "@/lib/api/event/endpoints";
import { useSeatReservation } from "./seat-reservation-session-provider";
import SeatReservationSessionWrapper from "./seat-reservation-session-wrapper";

const STALE_TIME_MS = 1000 * 60 * 5;

interface SeatReservationSessionClientProps {
	initialEvent: PublicEventInfo | null;
	eventSlug: string;
}

export default function SeatReservationSessionClient({
	initialEvent,
	eventSlug,
}: SeatReservationSessionClientProps) {
	const { session } = useSeatReservation();

	const { data: event } = useQuery({
		queryKey: ["public-event", eventSlug],
		queryFn: () => getPublicEventById(eventSlug ?? ""),
		initialData: initialEvent,
		enabled: Boolean(eventSlug),
		retry: 2,
		staleTime: STALE_TIME_MS,
	});

	// session is guaranteed to exist because SeatReservationSessionProvider
	// guards its children and is fetched in the layout
	if (!session) return null;

	return (
		<SeatReservationSessionWrapper
			session={session}
			eventTitle={event?.title ?? null}
			eventSlug={eventSlug ?? null}
		/>
	);
}
