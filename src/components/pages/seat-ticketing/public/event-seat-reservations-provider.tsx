"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { PublicEventInfo } from "@/lib/api/event/endpoints";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";

interface EventSeatReservationsContextValue {
	publicEvent: PublicEventInfo | null;
	eventSlug: string | null;
	publicSessions: EventSeatSession[] | null;
}

const EventSeatReservationsContext =
	createContext<EventSeatReservationsContextValue | null>(null);

interface EventSeatReservationsProviderProps {
	children: ReactNode;
	publicEvent: PublicEventInfo | null;
	eventSlug: string | null;
	publicSessions: EventSeatSession[] | null;
}

export function EventSeatReservationsProvider({
	children,
	publicEvent,
	eventSlug,
	publicSessions,
}: EventSeatReservationsProviderProps) {
	return (
		<EventSeatReservationsContext.Provider
			value={{ publicEvent, eventSlug, publicSessions }}
		>
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
