import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SeatCheckoutSessionState {
	checkoutSessionUuid: string | null;
	hasHydrated: boolean;
	setCheckoutSessionUuid: (uuid: string) => void;
	clearCheckoutSessionUuid: () => void;
	setHasHydrated: (state: boolean) => void;
}

export const useSeatCheckoutStore = create(
	persist<SeatCheckoutSessionState>(
		(set) => ({
			checkoutSessionUuid: null,
			hasHydrated: false,
			setCheckoutSessionUuid: (uuid) => set({ checkoutSessionUuid: uuid }),
			clearCheckoutSessionUuid: () => set({ checkoutSessionUuid: null }),
			setHasHydrated: (state) => set({ hasHydrated: state }),
		}),
		{
			name: "seat-checkout-session",
			storage: createJSONStorage(() => localStorage),
			skipHydration: true, // We will manually hydrate to ensure it happens on the client
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
