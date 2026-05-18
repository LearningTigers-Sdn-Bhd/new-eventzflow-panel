import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
	rentableItemId: number;
	name: string;
	unitOfMeasure: string;
	agreedPrice: number;
	quantity: number;
	notes?: string;
	imageUrl?: string | null;
}

export interface CartPrinting {
	printingServiceId: number;
	name: string;
	unitOfMeasure: string;
	agreedPrice: number;
	quantity: number;
	notes?: string;
	fileReference?: string;
	imageUrl?: string | null;
}

interface ExhibitorCartState {
	items: CartItem[];
	printings: CartPrinting[];

	// Items actions
	addItem: (item: CartItem) => void;
	updateItemQuantity: (rentableItemId: number, quantity: number) => void;
	updateItemNotes: (rentableItemId: number, notes: string) => void;
	removeItem: (rentableItemId: number) => void;
	clearItems: () => void;

	// Printings actions
	addPrinting: (printing: CartPrinting) => void;
	updatePrintingQuantity: (printingServiceId: number, quantity: number) => void;
	updatePrintingNotes: (printingServiceId: number, notes: string) => void;
	updatePrintingFileReference: (
		printingServiceId: number,
		fileReference: string,
	) => void;
	removePrinting: (printingServiceId: number) => void;
	clearPrintings: () => void;

	// General actions
	clearCart: () => void;
	getTotalAmount: () => number;
	getItemsCount: () => number;
}

export const useExhibitorCart = create<ExhibitorCartState>()(
	persist(
		(set, get) => ({
			items: [],
			printings: [],

			// Items actions
			addItem: (item) =>
				set((state) => {
					const existingIndex = state.items.findIndex(
						(i) => i.rentableItemId === item.rentableItemId,
					);

					if (existingIndex >= 0) {
						// Update existing item
						const newItems = [...state.items];
						newItems[existingIndex] = {
							...newItems[existingIndex],
							quantity: newItems[existingIndex].quantity + item.quantity,
						};
						return { items: newItems };
					}

					// Add new item
					return { items: [...state.items, item] };
				}),

			updateItemQuantity: (rentableItemId, quantity) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.rentableItemId === rentableItemId
							? { ...item, quantity }
							: item,
					),
				})),

			updateItemNotes: (rentableItemId, notes) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.rentableItemId === rentableItemId ? { ...item, notes } : item,
					),
				})),

			removeItem: (rentableItemId) =>
				set((state) => ({
					items: state.items.filter(
						(item) => item.rentableItemId !== rentableItemId,
					),
				})),

			clearItems: () => set({ items: [] }),

			// Printings actions
			addPrinting: (printing) =>
				set((state) => {
					const existingIndex = state.printings.findIndex(
						(p) => p.printingServiceId === printing.printingServiceId,
					);

					if (existingIndex >= 0) {
						// Update existing printing
						const newPrintings = [...state.printings];
						newPrintings[existingIndex] = {
							...newPrintings[existingIndex],
							quantity:
								newPrintings[existingIndex].quantity + printing.quantity,
						};
						return { printings: newPrintings };
					}

					// Add new printing
					return { printings: [...state.printings, printing] };
				}),

			updatePrintingQuantity: (printingServiceId, quantity) =>
				set((state) => ({
					printings: state.printings.map((printing) =>
						printing.printingServiceId === printingServiceId
							? { ...printing, quantity }
							: printing,
					),
				})),

			updatePrintingNotes: (printingServiceId, notes) =>
				set((state) => ({
					printings: state.printings.map((printing) =>
						printing.printingServiceId === printingServiceId
							? { ...printing, notes }
							: printing,
					),
				})),

			updatePrintingFileReference: (printingServiceId, fileReference) =>
				set((state) => ({
					printings: state.printings.map((printing) =>
						printing.printingServiceId === printingServiceId
							? { ...printing, fileReference }
							: printing,
					),
				})),

			removePrinting: (printingServiceId) =>
				set((state) => ({
					printings: state.printings.filter(
						(printing) => printing.printingServiceId !== printingServiceId,
					),
				})),

			clearPrintings: () => set({ printings: [] }),

			// General actions
			clearCart: () => set({ items: [], printings: [] }),

			getTotalAmount: () => {
				const state = get();
				const itemsTotal = state.items.reduce(
					(sum, item) => sum + item.agreedPrice * item.quantity,
					0,
				);
				const printingsTotal = state.printings.reduce(
					(sum, printing) => sum + printing.agreedPrice * printing.quantity,
					0,
				);
				return itemsTotal + printingsTotal;
			},

			getItemsCount: () => {
				const state = get();
				return state.items.length + state.printings.length;
			},
		}),
		{
			name: "exhibitor-cart-storage",
		},
	),
);
