"use client";

import * as React from "react";

/**
 * Column order state persisted to localStorage under `storageKey`.
 * Empty array means "use the table's default (column-def) order".
 */
export function usePersistedColumnOrder(storageKey: string) {
	const [columnOrder, setColumnOrderState] = React.useState<string[]>([]);

	// Hydrate from localStorage after mount — this is a "use client" component
	// but Next.js still server-renders it, where localStorage doesn't exist.
	// Reading in an effect keeps this client-only and avoids a hydration
	// mismatch that would otherwise drop the persisted order.
	React.useEffect(() => {
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw) setColumnOrderState(JSON.parse(raw) as string[]);
		} catch {
			// ignore corrupt/inaccessible storage
		}
	}, [storageKey]);

	const setColumnOrder = React.useCallback(
		(order: string[] | ((prev: string[]) => string[])) => {
			setColumnOrderState((prev) => {
				const next = typeof order === "function" ? order(prev) : order;
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

	const resetColumnOrder = React.useCallback(() => {
		try {
			localStorage.removeItem(storageKey);
		} catch {
			// ignore inaccessible storage
		}
		setColumnOrderState([]);
	}, [storageKey]);

	return [columnOrder, setColumnOrder, resetColumnOrder] as const;
}
