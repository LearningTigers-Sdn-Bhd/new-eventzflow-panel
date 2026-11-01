"use client";

import { useCallback, useEffect, useState } from "react";

// ponytail: kept in this browser only, so a second device does not see the marks.
// Move to a claimed_at column (like voided_at) if more than one device needs it.
const read = (key: string): Set<string> => {
	try {
		const raw = window.localStorage.getItem(key);
		return new Set(raw ? (JSON.parse(raw) as string[]) : []);
	} catch {
		return new Set();
	}
};

/** Which winners already collected their prize, saved per lucky draw session. */
export function useClaimedWinners(eventId: string, sessionId: number) {
	const key = `lucky-draw-claimed:${eventId}:${sessionId}`;
	const [claimed, setClaimed] = useState<Set<string>>(new Set());

	// Load after mount (not in the initializer) so server and client markup match
	useEffect(() => {
		setClaimed(read(key));
		const onStorage = (e: StorageEvent) => {
			if (e.key === key) setClaimed(read(key));
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, [key]);

	const toggleClaimed = useCallback(
		(publicId: string) => {
			// Start from storage, not state, so a click can never wipe earlier marks
			const next = read(key);
			if (!next.delete(publicId)) next.add(publicId);
			try {
				window.localStorage.setItem(key, JSON.stringify([...next]));
			} catch {
				// storage blocked: the mark still shows until refresh
			}
			setClaimed(next);
		},
		[key],
	);

	return { claimed, toggleClaimed };
}
