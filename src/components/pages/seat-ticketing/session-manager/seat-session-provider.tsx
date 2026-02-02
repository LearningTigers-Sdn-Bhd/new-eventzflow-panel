"use client";

import { type ReactNode, useEffect } from "react";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import { useSeatSessionStore } from "./use-seat-session-store";

interface SeatSessionProviderProps {
	children: ReactNode;
	initialSession: EventSeatSession;
}

export function SeatSessionProvider({
	children,
	initialSession,
}: SeatSessionProviderProps) {
	const setSession = useSeatSessionStore((state) => state.setSession);

	useEffect(() => {
		setSession(initialSession);
	}, [initialSession, setSession]);

	return <>{children}</>;
}
