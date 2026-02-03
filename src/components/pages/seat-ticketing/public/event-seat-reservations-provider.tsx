"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { PublicEventInfo } from "@/lib/api/event/endpoints";

interface EventSeatReservationsContextValue {
	publicEvent: PublicEventInfo | null;
	eventSlug: string | null;
}

const EventSeatReservationsContext =
	createContext<EventSeatReservationsContextValue | null>(null);

interface EventSeatReservationsProviderProps {
	children: ReactNode;
	publicEvent: PublicEventInfo | null;
	eventSlug: string | null;
}

export function EventSeatReservationsProvider({
	children,
	publicEvent,
	eventSlug,
}: EventSeatReservationsProviderProps) {
	return (
		<EventSeatReservationsContext.Provider value={{ publicEvent, eventSlug }}>
			{children}
		</EventSeatReservationsContext.Provider>
	);
}

export function useEventSeatReservations() {
	const context = useContext(EventSeatReservationsContext);
	if (!context) {
		throw new Error(
			"useEventSeatReservations must be used within EventSeatReservationsProvider",
		);
	}
	return context;
}

export function useEventSeatReservationsSafe() {
	return useContext(EventSeatReservationsContext);
}
