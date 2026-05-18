"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EventSeatReservationsHeader from "@/components/pages/seat-ticketing/public/event-seat-reservations-header";
import { useEventSeatReservationsSafe } from "@/components/pages/seat-ticketing/public/event-seat-reservations-provider";
import EventSeatReservationsTicketing from "@/components/pages/seat-ticketing/public/event-seat-reservations-ticketing";
import { getAllPublicSession } from "@/lib/api/seat-ticketing";

const STALE_TIME_MS = 1000 * 60 * 5;

export default function SeatReservationsPage() {
	const context = useEventSeatReservationsSafe();
	const params = useParams();
	const slugFromParams = params.slug as string | undefined;
	const slug = context?.eventSlug ?? slugFromParams ?? null;
	const initialSessions = context?.publicSessions ?? undefined;
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const {
		data: sessions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public-seat-sessions", slug],
		queryFn: () => getAllPublicSession({ eventSlug: slug ?? "" }),
		enabled: Boolean(slug),
		retry: 2,
		staleTime: STALE_TIME_MS,
		initialData: initialSessions,
	});

	return (
		<main className="min-h-screen bg-slate-50">
			<EventSeatReservationsHeader
				event={context?.publicEvent ?? null}
				sessions={sessions}
			/>
			<div className="container mx-auto max-w-7xl px-2 py-8 md:px-0">
				<EventSeatReservationsTicketing
					event={context?.publicEvent ?? null}
					sessions={sessions}
					isLoading={isLoading}
					error={error}
					eventSlug={slug}
					isHydrated={isMounted}
				/>
			</div>
		</main>
	);
}
