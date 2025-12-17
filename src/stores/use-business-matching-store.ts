import { create } from "zustand";

interface BusinessMatchingStore {
  selectedBusinessMatchingDate: string | undefined;
  setSelectedBusinessMatchingDate: (date: string | undefined) => void;
}

export const useBusinessMatchingStore = create<BusinessMatchingStore>((set) => ({
  selectedBusinessMatchingDate: undefined,
  setSelectedBusinessMatchingDate: (date) => set({ selectedBusinessMatchingDate: date }),
}));
