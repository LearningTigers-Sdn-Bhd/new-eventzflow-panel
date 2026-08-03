"use client";

import { create } from "zustand";

interface FullScreenDialogState {
	openDialogs: Record<string, boolean>;
	setOpen: (key: string, open: boolean) => void;
}

// Full-screen exhibitor dialogs (Booth Prices, Booth Inventory, Packages, Vouchers) manage
// their own open state locally. A plain useState resets to closed whenever the page that
// renders them unmounts, which Next.js does on every in-app route change — so navigating
// away and back closed the dialog even though the user never explicitly closed it. Storing
// the flag here instead survives the remount, matching how the global useDialog-based
// modals (e.g. Create Ticket) already behave.
export const useFullScreenDialogStore = create<FullScreenDialogState>(
	(set) => ({
		openDialogs: {},
		setOpen: (key, open) =>
			set((state) => ({ openDialogs: { ...state.openDialogs, [key]: open } })),
	}),
);
