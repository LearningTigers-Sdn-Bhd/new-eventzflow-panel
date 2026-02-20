"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getPublicEventById,
	type PublicEventInfo,
} from "@/lib/api/event/endpoints";
import ReservationCheckoutPage from "./reservation-checkout-page";

interface ReservationCheckoutClientProps {
	initialEvent: PublicEventInfo | null;
	eventSlug: string;
}

export default function ReservationCheckoutClient({
	initialEvent,
	eventSlug,
}: ReservationCheckoutClientProps) {
	const { data: event } = useQuery({
		queryKey: ["public-event", eventSlug],
		queryFn: () => getPublicEventById(eventSlug ?? ""),
		initialData: initialEvent,
		enabled: Boolean(eventSlug),
		retry: 2,
		staleTime: 1000 * 60 * 5,
	});

	return <ReservationCheckoutPage event={event} />;
}
