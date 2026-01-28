"use client";

import { useEffect, useState } from "react";
import { cable } from "@/lib/cable";
import type { CheckInBroadcast } from "@/lib/api/check-in-display/types";

/**
 * Hook to connect to the WelcomeScreenChannel for real-time check-in updates
 * @param eventId - The event ID to subscribe to
 * @returns The latest check-in data or null if no check-in has occurred
 */
export function useWelcomeScreenChannel(eventId: string | number | null) {
	const [latestCheckIn, setLatestCheckIn] = useState<CheckInBroadcast | null>(
		null,
	);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (!eventId) return;

		const subscription = cable.subscriptions.create(
			{ channel: "WelcomeScreenChannel", event_id: eventId },
			{
				connected() {
					setIsConnected(true);
				},
				disconnected() {
					setIsConnected(false);
				},
				received(data: CheckInBroadcast) {
					setLatestCheckIn(data);
				},
			},
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [eventId]);

	return { latestCheckIn, isConnected };
}
