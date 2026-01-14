"use client";

import { create } from "zustand";

interface ResourceActionsStore {
	actions: React.ReactNode;
	setActions: (actions: React.ReactNode) => void;
	clearActions: () => void;
}

export const useResourceActionsStore = create<ResourceActionsStore>((set) => ({
	actions: null,
	setActions: (actions) => set({ actions }),
	clearActions: () => set({ actions: null }),
}));
