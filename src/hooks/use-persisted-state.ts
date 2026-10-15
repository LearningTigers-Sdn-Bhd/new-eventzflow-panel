"use client";

import * as React from "react";

/**
 * useState mirrored to localStorage under `storageKey` (JSON-serialized).
 * Hydrates after mount to avoid SSR/hydration mismatches — the first render
 * always uses `initialValue`.
 */
export function usePersistedState<T>(storageKey: string, initialValue: T) {
	const [value, setValueState] = React.useState<T>(initialValue);

	React.useEffect(() => {
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw !== null) setValueState(JSON.parse(raw) as T);
		} catch {
			// ignore corrupt/inaccessible storage
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageKey]);

	const setValue = React.useCallback(
		(update: T | ((prev: T) => T)) => {
			setValueState((prev) => {
				const next =
					typeof update === "function"
						? (update as (prev: T) => T)(prev)
						: update;
				try {
					localStorage.setItem(storageKey, JSON.stringify(next));
				} catch {
					// ignore quota / private-mode errors
				}
				return next;
			});
		},
		[storageKey],
	);

	return [value, setValue] as const;
}
