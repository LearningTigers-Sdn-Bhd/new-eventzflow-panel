"use client";

import { create } from "zustand";

interface ResourceEditorStore {
	isPreviewMode: boolean;
	showToC: boolean;
	togglePreviewMode: () => void;
	toggleToC: () => void;
	setPreviewMode: (value: boolean) => void;
	setToC: (value: boolean) => void;
}

export const useResourceEditorStore = create<ResourceEditorStore>((set) => ({
	isPreviewMode: false,
	showToC: false,
	togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
	toggleToC: () => set((state) => ({ showToC: !state.showToC })),
	setPreviewMode: (isPreviewMode) => set({ isPreviewMode }),
	setToC: (showToC) => set({ showToC }),
}));
