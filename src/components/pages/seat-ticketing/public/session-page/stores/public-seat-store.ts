import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
	EventSeatSection,
	EventSeatSession,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";

interface SeatReservationState {
	// Data
	session: Omit<EventSeatSession, "event_seat_venues"> | null;
	sections: Record<number, EventSeatSection>;
	seats: Record<number, EventTicketSeat>; // Currently hydrated seats

	// Selection (Persisted metadata)
	selectedSeats: Record<number, EventTicketSeat>;

	// UI Status
	hydratingSectionIds: Set<number>;
	hydratedSectionIds: Set<number>;
	activeSectionId: number | null;
	isProcessing: boolean;
	isWarning: boolean;
	error: string | null;

	// Lifecycle
	expiresAt: string | null;
	persistedSessionId: number | null;

	// Actions
	initialize: (session: EventSeatSession) => void;
	setActiveSection: (sectionId: number | null) => void;
	hydrateSection: (
		sectionId: number,
		fetchFn: (
			id: number,
		) => Promise<{ section_id: number; seats: EventTicketSeat[] }>,
	) => Promise<void>;
	updateSeat: (seatDelta: Partial<EventTicketSeat> & { id: number }) => void;
	toggleSeat: (
		seatId: number,
		lockFn: (id: number) => Promise<unknown>,
		unlockFn: (id: number) => Promise<unknown>,
	) => Promise<void>;
	setProcessing: (val: boolean) => void;
	setIsWarning: (val: boolean) => void;
	setExpiresAt: (time: string | null) => void;
	goToNextSection: () => void;
	goToPrevSection: () => void;
	reset: () => void;
}

export const usePublicSeatStore = create<SeatReservationState>()(
	persist(
		(set, get) => ({
			session: null,
			sections: {},
			seats: {},
			selectedSeats: {},
			hydratingSectionIds: new Set(),
			hydratedSectionIds: new Set(),
			activeSectionId: null,
			isProcessing: false,
			isWarning: false,
			error: null,
			expiresAt: null,
			persistedSessionId: null,

			initialize: (session) => {
				const previousSessionId = get().persistedSessionId;
				const isSessionChanged =
					typeof previousSessionId === "number" &&
					previousSessionId !== session.id;

				const sections: Record<number, EventSeatSection> = {};
				session.event_seat_venues?.forEach((venue) => {
					venue.event_seat_sections?.forEach((section) => {
						sections[section.id] = section;
					});
				});
				const { event_seat_venues, ...sessionData } = session;

				set({
					session: sessionData,
					sections,
					seats: {},
					selectedSeats: isSessionChanged ? {} : get().selectedSeats,
					hydratingSectionIds: new Set(),
					hydratedSectionIds: new Set(),
					activeSectionId: null,
					error: null,
					expiresAt: isSessionChanged ? null : get().expiresAt,
					persistedSessionId: session.id,
				});
			},

			setActiveSection: (sectionId) => {
				const currentActive = get().activeSectionId;
				if (currentActive === sectionId) return;

				set({
					activeSectionId: sectionId,
					seats: {},
					hydratedSectionIds: new Set(),
				});
			},

			hydrateSection: async (sectionId, fetchFn) => {
				const { hydratingSectionIds, hydratedSectionIds, activeSectionId } =
					get();
				if (sectionId !== activeSectionId) return;
				if (
					hydratingSectionIds.has(sectionId) ||
					hydratedSectionIds.has(sectionId)
				)
					return;

				set((state) => ({
					error: null,
					hydratingSectionIds: new Set(state.hydratingSectionIds).add(
						sectionId,
					),
				}));

				try {
					const response = await fetchFn(sectionId);
					if (get().activeSectionId !== sectionId) return;

					set((state) => {
						const newSeats = { ...state.seats };
						for (const seat of response.seats) {
							newSeats[seat.id] = seat;
						}
						return {
							seats: newSeats,
							error: null,
							hydratingSectionIds: new Set(
								Array.from(state.hydratingSectionIds).filter(
									(id) => id !== sectionId,
								),
							),
							hydratedSectionIds: new Set(state.hydratedSectionIds).add(
								sectionId,
							),
						};
					});
				} catch (_e) {
					set((state) => ({
						hydratingSectionIds: new Set(
							Array.from(state.hydratingSectionIds).filter(
								(id) => id !== sectionId,
							),
						),
						error: "Failed to load seats",
					}));
					toast.error("Failed to load section seats");
				}
			},

			toggleSeat: async (seatId, lockFn, unlockFn) => {
				const { seats, selectedSeats } = get();
				const isCurrentlySelected = !!selectedSeats[seatId];

				const seat = seats[seatId] || selectedSeats[seatId];
				if (!seat) return;

				if (!isCurrentlySelected && Object.keys(selectedSeats).length >= 6) {
					toast.error("You can only select up to 6 seats per reservation.", {
						id: "seat-limit-reached",
					});
					return;
				}

				set({ isProcessing: true });
				try {
					if (isCurrentlySelected) {
						await unlockFn(seatId);
						set((state) => {
							const newSelected = { ...state.selectedSeats };
							delete newSelected[seatId];
							return { selectedSeats: newSelected, isProcessing: false };
						});
					} else {
						await lockFn(seatId);
						set((state) => ({
							selectedSeats: { ...state.selectedSeats, [seatId]: seat },
							isProcessing: false,
						}));
					}
				} catch (e: unknown) {
					set({ isProcessing: false });
					if (e && typeof e === "object" && "status" in e && e.status === 409) {
						toast.error("This seat was just taken by another user.");
					} else {
						toast.error("Failed to update seat selection");
					}
				}
			},

			updateSeat: (seatDelta) => {
				set((state) => {
					const updatedHydrated = { ...state.seats };
					if (updatedHydrated[seatDelta.id]) {
						updatedHydrated[seatDelta.id] = {
							...updatedHydrated[seatDelta.id],
							...seatDelta,
						};
					}

					const updatedSelected = { ...state.selectedSeats };
					if (updatedSelected[seatDelta.id]) {
						if (
							seatDelta.status &&
							seatDelta.status !== "locked" &&
							seatDelta.status !== "available"
						) {
							delete updatedSelected[seatDelta.id];
						} else {
							updatedSelected[seatDelta.id] = {
								...updatedSelected[seatDelta.id],
								...seatDelta,
							};
						}
					}

					return { seats: updatedHydrated, selectedSeats: updatedSelected };
				});
			},

			setProcessing: (isProcessing) => set({ isProcessing }),
			setIsWarning: (isWarning) => set({ isWarning }),
			setExpiresAt: (expiresAt) => set({ expiresAt }),

			goToNextSection: () => {
				const { sections, activeSectionId } = get();
				const sectionList = Object.values(sections);
				if (sectionList.length === 0) return;
				const currentIndex = activeSectionId
					? sectionList.findIndex((s) => s.id === activeSectionId)
					: -1;
				const nextId =
					currentIndex === sectionList.length - 1
						? null
						: sectionList[currentIndex + 1].id;
				get().setActiveSection(nextId);
			},

			goToPrevSection: () => {
				const { sections, activeSectionId } = get();
				const sectionList = Object.values(sections);
				if (sectionList.length === 0) return;
				const currentIndex = activeSectionId
					? sectionList.findIndex((s) => s.id === activeSectionId)
					: -1;
				let prevId: number | null;
				if (currentIndex === -1)
					prevId = sectionList[sectionList.length - 1].id;
				else if (currentIndex === 0) prevId = null;
				else prevId = sectionList[currentIndex - 1].id;
				get().setActiveSection(prevId);
			},

			reset: () => {
				// Wipe interaction state but KEEP the session to avoid blank pages
				set({
					seats: {},
					selectedSeats: {},
					hydratingSectionIds: new Set(),
					hydratedSectionIds: new Set(),
					activeSectionId: null,
					isProcessing: false,
					isWarning: false,
					error: null,
					expiresAt: null,
				});

				if (typeof window !== "undefined") {
					localStorage.removeItem("public-seat-reservation-storage");
				}
			},
		}),
		{
			name: "public-seat-reservation-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				selectedSeats: state.selectedSeats,
				expiresAt: state.expiresAt,
				persistedSessionId: state.persistedSessionId,
			}),
		},
	),
);
