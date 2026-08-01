"use client";

import { useFullScreenDialogStore } from "@/stores/full-screen-dialog-store";

/**
 * Drop-in replacement for `React.useState(false)` for a full-screen dialog's open state.
 * Backed by a store instead of component state so the dialog stays open across an in-app
 * route change (the page that renders it unmounts and remounts on navigation).
 *
 * @param key Unique per dialog *type* (and per event, if the same dialog can be mounted for
 * different events) — e.g. `` `package-dialog-${eventId}` ``.
 */
export function useFullScreenDialogOpen(
	key: string,
): [boolean, (open: boolean) => void] {
	const isOpen = useFullScreenDialogStore(
		(state) => state.openDialogs[key] ?? false,
	);
	const setOpen = useFullScreenDialogStore((state) => state.setOpen);

	return [isOpen, (open: boolean) => setOpen(key, open)];
}
