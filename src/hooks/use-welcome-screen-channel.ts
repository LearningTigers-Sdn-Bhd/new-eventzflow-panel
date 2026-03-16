"use client";

import { useCallback, useEffect, useState } from "react";
import type {
	CheckInBroadcast,
	WelcomeScreenMessage,
} from "@/lib/api/check-in-display/types";
import { cable } from "@/lib/cable";

export function useWelcomeScreenChannel(eventId: string | number | null) {
	const [latestCheckIn, setLatestCheckIn] = useState<CheckInBroadcast | null>(
		null,
	);
	const [queueSize, setQueueSize] = useState(0);
	const [isConnected, setIsConnected] = useState(false);

	const handleMessage = useCallback((data: WelcomeScreenMessage) => {
		switch (data.type) {
			case "state":
				if (data.name) {
					setLatestCheckIn({
						name: data.name,
						table_label: data.table_label ?? null,
						seating_context: data.seating_context,
						checked_in_at: new Date().toISOString(),
						voice_id: data.voice_id,
						voice_ids: data.voice_ids,
					});
				} else {
					setLatestCheckIn(null);
				}
				setQueueSize(data.queue_size);
				break;

			case "display":
				setLatestCheckIn({
					name: data.name,
					table_label: data.table_label ?? null,
					seating_context: data.seating_context,
					checked_in_at: data.checked_in_at,
					voice_id: data.voice_id,
					voice_ids: data.voice_ids,
				});
				break;

			case "queue_update":
				setQueueSize(data.queue_size);
				break;

			case "clear":
				setLatestCheckIn(null);
				break;
		}
	}, []);

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
				received(data: WelcomeScreenMessage) {
					handleMessage(data);
				},
			},
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [eventId, handleMessage]);

	return { latestCheckIn, queueSize, isConnected };
}
