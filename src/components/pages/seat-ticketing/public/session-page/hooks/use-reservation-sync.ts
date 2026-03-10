"use client";

import { useEffect } from "react";
import type { EventTicketSeat } from "@/lib/api/seat-ticketing/response";
import { cable } from "@/lib/cable";
import { usePublicSeatStore } from "../stores/public-seat-store";

/**
 * Hook to handle real-time seat status updates via ActionCable.
 * Listens for 'seat_updated' events and updates the local store.
 */
export function useReservationSync() {
	const sessionPublicId = usePublicSeatStore(
		(state) => state.session?.public_id,
	);
	const updateSeat = usePublicSeatStore((state) => state.updateSeat);

	useEffect(() => {
		if (!sessionPublicId) return;

		const channel = cable.subscriptions.create(
			{
				channel: "EventSeatSessionChannel",
				session_id: sessionPublicId,
			},
			{
				received: (data: {
					type: string;
					seat: EventTicketSeat & { status: string };
				}) => {
					if (data.type === "seat_updated") {
						updateSeat(data.seat);
					}
				},
			},
		);

		return () => {
			channel.unsubscribe();
		};
	}, [sessionPublicId, updateSeat]);
}
