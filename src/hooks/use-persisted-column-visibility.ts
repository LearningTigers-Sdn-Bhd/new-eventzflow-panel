"use client";

import type { VisibilityState } from "@tanstack/react-table";
import * as React from "react";

/**
 * Column visibility persisted to localStorage under `storageKey`.
 * Callers that compute a default visibility (e.g. "show first 3 custom
 * labels") should skip it when `hasSavedColumnVisibility(storageKey)` is
 * true, so a saved preference isn't clobbered.
 */
export function usePersistedColumnVisibility(
	storageKey: string,
	initialVisibility: VisibilityState,
) {
	const [columnVisibility, setColumnVisibilityState] =
		React.useState<VisibilityState>(initialVisibility);

	// Hydrate after mount — client-only, avoids SSR/hydration mismatch.
	React.useEffect(() => {
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw) setColumnVisibilityState(JSON.parse(raw) as VisibilityState);
		} catch {
			// ignore corrupt/inaccessible storage
		}
	}, [storageKey]);

	const setColumnVisibility = React.useCallback(
		(
			update: VisibilityState | ((prev: VisibilityState) => VisibilityState),
		) => {
			setColumnVisibilityState((prev) => {
				const next = typeof update === "function" ? update(prev) : update;
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

	const resetColumnVisibility = React.useCallback(
		(defaultVisibility: VisibilityState) => {
			try {
				localStorage.removeItem(storageKey);
			} catch {
				// ignore inaccessible storage
			}
			setColumnVisibilityState(defaultVisibility);
		},
		[storageKey],
	);

	return [
		columnVisibility,
		setColumnVisibility,
		resetColumnVisibility,
	] as const;
}

/**
 * Synchronous check for whether a visibility preference was already saved.
 * localStorage is always current (unlike a React state flag, which can be
 * stale within the same effect-flush if the hydration effect and a
 * default-computation effect both fire on the same render pass).
 */
export function hasSavedColumnVisibility(storageKey: string): boolean {
	try {
		return localStorage.getItem(storageKey) !== null;
	} catch {
		return false;
	}
}
