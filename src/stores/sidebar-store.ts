"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
	isMainSidebarOpen: boolean;
	isEventSidebarOpen: boolean;
}

interface SidebarActions {
	setMainSidebarOpen: (open: boolean) => void;
	setEventSidebarOpen: (open: boolean) => void;
	toggleMainSidebar: () => void;
	toggleEventSidebar: () => void;
	resetSidebars: () => void;
}

const initialState: SidebarState = {
	isMainSidebarOpen: true,
	isEventSidebarOpen: true,
};

export const useSidebarStore = create<SidebarState & SidebarActions>()(
	persist(
		(set) => ({
			...initialState,

			setMainSidebarOpen: (open: boolean) => {
				set({ isMainSidebarOpen: open });
			},

			setEventSidebarOpen: (open: boolean) => {
				set({ isEventSidebarOpen: open });
			},

			toggleMainSidebar: () => {
				set((state) => ({ isMainSidebarOpen: !state.isMainSidebarOpen }));
			},

			toggleEventSidebar: () => {
				set((state) => ({ isEventSidebarOpen: !state.isEventSidebarOpen }));
			},

			resetSidebars: () => {
				set(initialState);
			},
		}),
		{
			name: "sidebar-storage",
		},
	),
);


