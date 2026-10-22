import { create } from "zustand";

interface BackendStatusState {
	unavailable: boolean;
	setUnavailable: (unavailable: boolean) => void;
}

// Not persisted: availability is a live observation, never restored from storage.
export const useBackendStatusStore = create<BackendStatusState>((set) => ({
	unavailable: false,
	setUnavailable: (unavailable) => set({ unavailable }),
}));
