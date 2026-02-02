import { create } from "zustand";
import {
	updateSeatSessionBlueprint,
	uploadVenueImage,
} from "@/lib/api/seat-ticketing/endpoints";
import type {
	BulkUpdateSeatAttributes,
	BulkUpdateSeatSessionRequest,
	BulkUpdateSectionAttributes,
	BulkUpdateVenueAttributes,
} from "@/lib/api/seat-ticketing/request";
import type {
	EventSeatSection,
	EventSeatSession,
	EventSeatVenue,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";

export type EditorMode = "venue_blueprint" | "seat_placement";
export type InteractionMode = "select" | "create";

interface SeatSessionState {
	session: EventSeatSession | null;
	mode: EditorMode;
	interactionMode: InteractionMode;
	isPanning: boolean;
	selectedSectionId: number | null;
	selectedSeatId: number | null;
	zoom: number;
	pan: { x: number; y: number };
	isSaving: boolean;
	error: string | null;

	// Track deletions for API sync
	deletedSectionIds: number[];
	deletedSeatIds: { seatId: number; sectionId: number }[];

	// Actions
	setSession: (session: EventSeatSession) => void;
	setMode: (mode: EditorMode) => void;
	setInteractionMode: (mode: InteractionMode) => void;
	setIsPanning: (isPanning: boolean) => void;
	setZoom: (zoom: number) => void;
	setPan: (pan: { x: number; y: number }) => void;

	selectSection: (id: number | null) => void;
	selectSeat: (id: number | null) => void;

	// Venue Actions
	updateVenue: (data: Partial<EventSeatVenue>) => void;

	// Section Actions
	addSection: (
		section: Omit<
			EventSeatSection,
			"id" | "event_seat_venue_id" | "created_at" | "updated_at"
		>,
	) => void;
	updateSection: (id: number, data: Partial<EventSeatSection>) => void;
	removeSection: (id: number) => void;

	// Seat Actions
	addSeat: (
		sectionId: number,
		seat: Omit<
			EventTicketSeat,
			"id" | "event_seat_section_id" | "created_at" | "updated_at"
		>,
	) => void;
	updateSeat: (id: number, data: Partial<EventTicketSeat>) => void;
	removeSeat: (id: number) => void;

	// Persistence
	save: () => Promise<void>;
}

export const useSeatSessionStore = create<SeatSessionState>((set, get) => ({
	session: null,
	mode: "venue_blueprint",
	interactionMode: "select",
	isPanning: false,
	selectedSectionId: null,
	selectedSeatId: null,
	zoom: 1,
	pan: { x: 0, y: 0 },
	isSaving: false,
	error: null,
	deletedSectionIds: [],
	deletedSeatIds: [],

	setSession: (session) => {
		// Ensure there is at least one venue to work with
		const processedSession = { ...session };
		if (
			!processedSession.event_seat_venues ||
			processedSession.event_seat_venues.length === 0
		) {
			const tempId = -Math.floor(Math.random() * 1000000);
			processedSession.event_seat_venues = [
				{
					id: tempId,
					event_seat_session_id: session.id,
					name: "Main Venue",
					total_row: 20,
					total_column: 20,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					event_seat_sections: [],
				},
			];
		}
		set({ session: processedSession, error: null });
	},
	setMode: (mode) =>
		set({ mode, interactionMode: "select", selectedSeatId: null }),
	setInteractionMode: (interactionMode) =>
		set({ interactionMode, isPanning: false }),
	setIsPanning: (isPanning) => set({ isPanning, interactionMode: "select" }),
	setZoom: (zoom) => set({ zoom }),
	setPan: (pan) => set({ pan }),

	selectSection: (id) => set({ selectedSectionId: id, selectedSeatId: null }),
	selectSeat: (id) => set({ selectedSeatId: id }),

	updateVenue: (data) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venues = [...state.session.event_seat_venues];
			venues[0] = { ...venues[0], ...data };
			return { session: { ...state.session, event_seat_venues: venues } };
		});
	},

	addSection: (sectionData) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];
			const sections = venue.event_seat_sections
				? [...venue.event_seat_sections]
				: [];

			// Use a temporary negative ID for new items
			const tempId = -Math.floor(Math.random() * 1000000);
			const newSection: EventSeatSection = {
				...sectionData,
				id: tempId,
				event_seat_venue_id: venue.id,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				event_ticket_seats: [],
			};

			const newVenue = {
				...venue,
				event_seat_sections: [...sections, newSection],
			};
			return {
				session: { ...state.session, event_seat_venues: [newVenue] },
				selectedSectionId: tempId,
			};
		});
	},

	updateSection: (id, data) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];
			const sections = venue.event_seat_sections?.map((s) =>
				s.id === id ? { ...s, ...data } : s,
			);
			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
			};
		});
	},

	removeSection: (id) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];

			// Track ID for deletion if it's a real backend ID (positive)
			const deletedIds = [...state.deletedSectionIds];
			if (id > 0) {
				deletedIds.push(id);
			}

			const sections = venue.event_seat_sections?.filter((s) => s.id !== id);
			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
				selectedSectionId:
					state.selectedSectionId === id ? null : state.selectedSectionId,
				deletedSectionIds: deletedIds,
			};
		});
	},

	addSeat: (sectionId, seatData) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];
			const sections = venue.event_seat_sections?.map((section) => {
				if (section.id !== sectionId) return section;

				const seats = section.event_ticket_seats
					? [...section.event_ticket_seats]
					: [];
				const tempId = -Math.floor(Math.random() * 1000000);
				const newSeat: EventTicketSeat = {
					...seatData,
					id: tempId,
					event_seat_section_id: sectionId,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};

				return { ...section, event_ticket_seats: [...seats, newSeat] };
			});

			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
			};
		});
	},

	updateSeat: (id, data) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];
			const sections = venue.event_seat_sections?.map((section) => ({
				...section,
				event_ticket_seats: section.event_ticket_seats?.map((seat) =>
					seat.id === id ? { ...seat, ...data } : seat,
				),
			}));
			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
			};
		});
	},

	removeSeat: (id) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];

			// Find which section this seat belongs to
			let sectionId = -1;
			venue?.event_seat_sections?.forEach((s) => {
				if (s.event_ticket_seats?.some((seat) => seat.id === id)) {
					sectionId = s.id;
				}
			});

			// Track ID for deletion if it's a real backend ID (positive)
			const deletedIds = [...state.deletedSeatIds];
			if (id > 0 && sectionId > 0) {
				deletedIds.push({ seatId: id, sectionId });
			}

			const sections = venue.event_seat_sections?.map((section) => ({
				...section,
				event_ticket_seats: section.event_ticket_seats?.filter(
					(seat) => seat.id !== id,
				),
			}));
			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
				selectedSeatId:
					state.selectedSeatId === id ? null : state.selectedSeatId,
				deletedSeatIds: deletedIds,
			};
		});
	},

	save: async () => {
		const { session, deletedSectionIds, deletedSeatIds } = get();
		if (!session) return;

		set({ isSaving: true, error: null });
		try {
			// 1. Upload image if present and venue is persisted
			const venue = session.event_seat_venues?.[0];
			if (venue?.image && venue.id > 0) {
				await uploadVenueImage(
					session.id.toString(),
					venue.id.toString(),
					venue.image,
				);
			}

			// 2. Perform bulk update for all other attributes
			const request: BulkUpdateSeatSessionRequest = {
				name: session.name,
				status: session.status as BulkUpdateSeatSessionRequest["status"],
				location: session.location,
				start_datetime: session.start_datetime,
				end_datetime: session.end_datetime,
				event_seat_venues_attributes: session.event_seat_venues?.map(
					(v): BulkUpdateVenueAttributes => {
						// 1. Map active sections
						const activeSections: BulkUpdateSectionAttributes[] =
							v.event_seat_sections?.map((s): BulkUpdateSectionAttributes => {
								// 1.1 Map active seats
								const activeSeats: BulkUpdateSeatAttributes[] =
									s.event_ticket_seats?.map(
										(st): BulkUpdateSeatAttributes => ({
											id: st.id > 0 ? st.id : undefined,
											name: st.name,
											extra_price: st.extra_price,
											row_set: st.row_set,
											col_set: st.col_set,
											ticket_id: st.ticket_id,
										}),
									) || [];

								// 1.2 Append deleted seats belonging to this section
								for (const d of deletedSeatIds) {
									if (d.sectionId === s.id) {
										activeSeats.push({
											id: d.seatId,
											_destroy: true,
										});
									}
								}

								return {
									id: s.id > 0 ? s.id : undefined,
									name: s.name,
									price: s.price,
									start_row: s.start_row,
									start_column: s.start_column,
									seat_row: s.seat_row,
									seat_column: s.seat_column,
									row_span: s.row_span,
									col_span: s.col_span,
									event_ticket_seats_attributes: activeSeats,
								};
							}) || [];

						// Append deleted sections to the venue
						for (const id of deletedSectionIds) {
							activeSections.push({
								id: id,
								_destroy: true,
							});
						}

						return {
							id: v.id > 0 ? v.id : undefined,
							name: v.name,
							total_row: v.total_row,
							total_column: v.total_column,
							aspect_ratio: v.aspect_ratio,
							event_seat_sections_attributes: activeSections,
						};
					},
				),
			};

			const updatedSession = await updateSeatSessionBlueprint(
				session.id.toString(),
				request,
			);

			// Reset deleted IDs after successful save
			set({
				session: updatedSession,
				isSaving: false,
				deletedSectionIds: [],
				deletedSeatIds: [],
			});
		} catch (e: unknown) {
			const errorMessage =
				e instanceof Error ? e.message : "Failed to save session";
			set({ error: errorMessage, isSaving: false });
		}
	},
}));
