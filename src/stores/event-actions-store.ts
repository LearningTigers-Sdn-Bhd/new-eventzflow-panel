"use client";

import { create } from "zustand";

interface EventActionsStore {
	actions: React.ReactNode;
	setActions: (actions: React.ReactNode) => void;
	clearActions: () => void;
}

export const useEventActionsStore = create<EventActionsStore>((set) => ({
	actions: null,
	setActions: (actions) => set({ actions }),
	clearActions: () => set({ actions: null }),
}));
