import { create } from "zustand";
import {
	updateSeatSessionBlueprint,
	uploadVenueImage,
} from "@/lib/api/seat-ticketing/endpoints";
import type {
	BulkUpdateGroupAttributes,
	BulkUpdateSeatAttributes,
	BulkUpdateSeatSessionRequest,
	BulkUpdateSectionAttributes,
	BulkUpdateVenueAttributes,
} from "@/lib/api/seat-ticketing/request";
import type {
	EventSeatGroup,
	EventSeatGroupAssignment,
	EventSeatSection,
	EventSeatSession,
	EventSeatVenue,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";

export type EditorMode = "venue_blueprint" | "seat_placement";
export type InteractionMode = "select" | "create";

export const seatSessionDraftKey = (sessionId: number) =>
	`seat-session-draft:${sessionId}`;

interface SeatSessionState {
	session: EventSeatSession | null;
	mode: EditorMode;
	interactionMode: InteractionMode;
	isPanning: boolean;
	selectedSectionId: number | null;
	selectedSeatId: number | null;
	selectedSeatIds: number[];
	selectedGroupId: number | null;
	activeGroupId: number | null;
	selectedSeatPosition: { row: number; col: number; sectionId: number } | null;
	zoom: number;
	pan: { x: number; y: number };
	isSaving: boolean;
	error: string | null;
	hasUnsavedChanges: boolean;

	// Track deletions for API sync
	deletedSectionIds: number[];
	deletedSeatIds: { seatId: number; sectionId: number }[];
	deletedGroupIds: { groupId: number; sectionId: number }[];

	// Actions
	setSession: (session: EventSeatSession) => void;
	initializeSession: (session: EventSeatSession) => void;
	resetViewState: () => void;
	setDeletedSectionIds: (ids: number[]) => void;
	setDeletedSeatIds: (ids: { seatId: number; sectionId: number }[]) => void;
	setDeletedGroupIds: (ids: { groupId: number; sectionId: number }[]) => void;
	setHasUnsavedChanges: (value: boolean) => void;
	setMode: (mode: EditorMode) => void;
	setInteractionMode: (mode: InteractionMode) => void;
	setIsPanning: (isPanning: boolean) => void;
	setZoom: (zoom: number) => void;
	setPan: (pan: { x: number; y: number }) => void;

	selectSection: (id: number | null) => void;
	selectSeat: (id: number | null) => void;
	toggleSeatSelection: (id: number) => void;
	selectGroup: (id: number | null) => void;
	setGroupPaintingMode: (groupId: number | null) => void;
	selectSeatPosition: (
		position: { row: number; col: number; sectionId: number } | null,
	) => void;

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

	// Group Actions
	addGroup: (sectionId: number, group: { name: string; extra_price: number }) => void;
	updateGroup: (id: number, data: Partial<EventSeatGroup>) => void;
	removeGroup: (id: number) => void;
	assignSeatsToGroup: (seatIds: number[], groupId: number | null) => void;

	// Seat Actions
	addSeat: (
		sectionId: number,
		seat: Omit<
			EventTicketSeat,
			| "id"
			| "event_seat_section_id"
			| "created_at"
			| "updated_at"
			| "visitor_id"
			| "locked_at"
			| "locked_by_session_id"
			| "status"
		>,
	) => void;
	updateSeat: (id: number, data: Partial<EventTicketSeat>) => void;
	removeSeat: (id: number) => void;

	// Persistence
	save: () => Promise<void>;
}

function syncSectionSeats(
	section: EventSeatSection,
	oldRows = 0,
	oldCols = 0,
): EventTicketSeat[] {
	const rows = section.seat_row || 0;
	const cols = section.seat_column || 0;
	const currentSeats = section.event_ticket_seats || [];

	const syncedSeats = currentSeats.filter(
		(s) => (s.row_set || 0) <= rows && (s.col_set || 0) <= cols,
	);

	if (rows > oldRows) {
		for (let r = oldRows + 1; r <= rows; r++) {
			for (let c = 1; c <= cols; c++) {
				syncedSeats.push({
					id: -Math.floor(Math.random() * 1000000000),
					event_seat_section_id: section.id,
					name: `${section.name}-${r}${String.fromCharCode(64 + c)}`,
					extra_price: 0,
					row_set: r,
					col_set: c,
					ticket_id: null,
					visitor_id: null,
					locked_at: null,
					locked_by_session_id: null,
					status: "available",
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				});
			}
		}
	}

	if (cols > oldCols) {
		for (let r = 1; r <= Math.min(rows, oldRows); r++) {
			for (let c = oldCols + 1; c <= cols; c++) {
				syncedSeats.push({
					id: -Math.floor(Math.random() * 1000000000),
					event_seat_section_id: section.id,
					name: `${section.name}-${r}${String.fromCharCode(64 + c)}`,
					extra_price: 0,
					row_set: r,
					col_set: c,
					ticket_id: null,
					visitor_id: null,
					locked_at: null,
					locked_by_session_id: null,
					status: "available",
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				});
			}
		}
	}

	return syncedSeats;
}

export const useSeatSessionStore = create<SeatSessionState>((set, get) => ({
	session: null,
	mode: "venue_blueprint",
	interactionMode: "select",
	isPanning: false,
	selectedSectionId: null,
	selectedSeatId: null,
	selectedSeatIds: [],
	selectedGroupId: null,
	activeGroupId: null,
	selectedSeatPosition: null,
	zoom: 1,
	pan: { x: 0, y: 0 },
	isSaving: false,
	error: null,
	hasUnsavedChanges: false,
	deletedSectionIds: [],
	deletedSeatIds: [],
	deletedGroupIds: [],

	setSession: (session) => {
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
					aspect_ratio: "square",
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					event_seat_sections: [],
				},
			];
		}
		set({ session: processedSession, error: null });
	},
	initializeSession: (session) => {
		const state = get();
		state.resetViewState();
		state.setSession(session);
		set({ hasUnsavedChanges: false });
	},
	resetViewState: () =>
		set({
			mode: "venue_blueprint",
			interactionMode: "select",
			isPanning: false,
			selectedSectionId: null,
			selectedSeatId: null,
			selectedSeatIds: [],
			selectedGroupId: null,
			activeGroupId: null,
			selectedSeatPosition: null,
			zoom: 1,
			pan: { x: 0, y: 0 },
			error: null,
			deletedSectionIds: [],
			deletedSeatIds: [],
			deletedGroupIds: [],
		}),
	setDeletedSectionIds: (ids) => set({ deletedSectionIds: ids }),
	setDeletedSeatIds: (ids) => set({ deletedSeatIds: ids }),
	setDeletedGroupIds: (ids) => set({ deletedGroupIds: ids }),
	setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
	setMode: (mode) =>
		set({
			mode,
			interactionMode: "select",
			selectedSeatId: null,
			selectedSeatIds: [],
			selectedGroupId: null,
			activeGroupId: null,
			selectedSeatPosition: null,
		}),
	setInteractionMode: (interactionMode) =>
		set({ interactionMode, isPanning: false }),
	setIsPanning: (isPanning) => set({ isPanning, interactionMode: "select" }),
	setZoom: (zoom) => set({ zoom }),
	setPan: (pan) => set({ pan }),

	selectSection: (id) =>
		set({
			selectedSectionId: id,
			selectedSeatId: null,
			selectedSeatIds: [],
			selectedGroupId: null,
			activeGroupId: null,
			selectedSeatPosition: null,
		}),
	selectSeat: (id) =>
		set({ 
			selectedSeatId: id, 
			selectedSeatIds: id ? [id] : [], 
			selectedGroupId: null, 
			selectedSeatPosition: null 
		}),
	toggleSeatSelection: (id) => {
		set((state) => {
			const selectedSeatIds = [...state.selectedSeatIds];
			const index = selectedSeatIds.indexOf(id);
			if (index > -1) {
				selectedSeatIds.splice(index, 1);
			} else {
				selectedSeatIds.push(id);
			}
			return { 
				selectedSeatIds,
				selectedSeatId: id,
				selectedSeatPosition: null // Clear grid selection when selecting actual seats
			};
		});
	},
	selectGroup: (id) =>
		set({ 
			selectedGroupId: id, 
			selectedSeatId: null, 
			selectedSeatIds: [],
			selectedSeatPosition: null 
		}),
	setGroupPaintingMode: (groupId) => 
		set({ activeGroupId: groupId, interactionMode: groupId ? "select" : get().interactionMode }),
	selectSeatPosition: (position) =>
		set({ 
			selectedSeatPosition: position, 
			selectedSeatId: null, 
			selectedSeatIds: [],
			selectedGroupId: null 
		}),

	updateVenue: (data) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venues = [...state.session.event_seat_venues];
			venues[0] = { ...venues[0], ...data };
			return {
				session: { ...state.session, event_seat_venues: venues },
				hasUnsavedChanges: true,
			};
		});
	},

	addSection: (sectionData) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];
			const sections = venue.event_seat_sections
				? [...venue.event_seat_sections]
				: [];

			const tempId = -Math.floor(Math.random() * 1000000);
			const newSection: EventSeatSection = {
				...sectionData,
				rotation: sectionData.rotation ?? 0,
				color: "blue", // Default for new sections
				id: tempId,
				event_seat_venue_id: venue.id,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				event_ticket_seats: [],
			};

			newSection.event_ticket_seats = syncSectionSeats(newSection);

			const newVenue = {
				...venue,
				event_seat_sections: [...sections, newSection],
			};
			return {
				session: { ...state.session, event_seat_venues: [newVenue] },
				selectedSectionId: tempId,
				hasUnsavedChanges: true,
			};
		});
	},

	updateSection: (id, data) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];
			const sections = venue.event_seat_sections?.map((s) => {
				if (s.id !== id) return s;
				const oldRows = s.seat_row || 0;
				const oldCols = s.seat_column || 0;
				const updatedSection = { ...s, ...data };

				if (data.seat_row !== undefined || data.seat_column !== undefined) {
					updatedSection.event_ticket_seats = syncSectionSeats(
						updatedSection,
						oldRows,
						oldCols,
					);
				}

				return updatedSection;
			});
			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
				hasUnsavedChanges: true,
			};
		});
	},

	removeSection: (id) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];

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
				hasUnsavedChanges: true,
			};
		});
	},

	addGroup: (sectionId, groupData) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];
			const sections = venue.event_seat_sections?.map((section) => {
				if (section.id !== sectionId) return section;

				const groups = section.event_seat_groups ? [...section.event_seat_groups] : [];
				const tempId = -Math.floor(Math.random() * 1000000);
				const newGroup: EventSeatGroup = {
					...groupData,
					color: "green", // Default for new groups
					id: tempId,
					event_seat_section_id: sectionId,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};

				return { ...section, event_seat_groups: [...groups, newGroup] };
			});

			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
				hasUnsavedChanges: true,
			};
		});
	},

	updateGroup: (id, data) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];
			const sections = venue.event_seat_sections?.map((section) => ({
				...section,
				event_seat_groups: section.event_seat_groups?.map((group) =>
					group.id === id ? { ...group, ...data } : group,
				),
			}));
			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
				hasUnsavedChanges: true,
			};
		});
	},

	removeGroup: (id) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];

			let sectionId = -1;
			venue?.event_seat_sections?.forEach((s) => {
				if (s.event_seat_groups?.some((g) => g.id === id)) {
					sectionId = s.id;
				}
			});

			const deletedIds = [...state.deletedGroupIds];
			if (id > 0 && sectionId > 0) {
				deletedIds.push({ groupId: id, sectionId });
			}

			const sections = venue.event_seat_sections?.map((section) => ({
				...section,
				event_seat_groups: section.event_seat_groups?.filter(
					(group) => group.id !== id,
				),
				event_ticket_seats: section.event_ticket_seats?.map(seat => {
					if (seat.event_seat_group_assignment?.event_seat_group_id === id) {
						return { ...seat, event_seat_group_assignment: null };
					}
					return seat;
				})
			}));

			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
				selectedGroupId: state.selectedGroupId === id ? null : state.selectedGroupId,
				deletedGroupIds: deletedIds,
				hasUnsavedChanges: true,
			};
		});
	},

	assignSeatsToGroup: (seatIds, groupId) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];

			const sections = venue.event_seat_sections?.map((section) => ({
				...section,
				event_ticket_seats: section.event_ticket_seats?.map((seat) => {
					if (!seatIds.includes(seat.id)) return seat;

					if (groupId === null) {
						return { ...seat, event_seat_group_assignment: null };
					}

					const assignment: EventSeatGroupAssignment = {
						id: seat.event_seat_group_assignment?.id || -Math.floor(Math.random() * 1000000),
						event_seat_group_id: groupId,
						event_ticket_seat_id: seat.id
					};

					return { ...seat, event_seat_group_assignment: assignment };
				})
			}));

			return {
				session: {
					...state.session,
					event_seat_venues: [{ ...venue, event_seat_sections: sections }],
				},
				hasUnsavedChanges: true
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
					visitor_id: null,
					locked_at: null,
					locked_by_session_id: null,
					status: "available",
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
				hasUnsavedChanges: true,
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
				hasUnsavedChanges: true,
			};
		});
	},

	removeSeat: (id) => {
		set((state) => {
			if (!state.session?.event_seat_venues?.[0]) return state;
			const venue = state.session.event_seat_venues[0];

			let sectionId = -1;
			venue?.event_seat_sections?.forEach((s) => {
				if (s.event_ticket_seats?.some((seat) => seat.id === id)) {
					sectionId = s.id;
				}
			});

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
				hasUnsavedChanges: true,
			};
		});
	},

	save: async () => {
		const { session, deletedSectionIds, deletedSeatIds, deletedGroupIds } = get();
		if (!session) return;

		set({ isSaving: true, error: null });
		try {
			const venue = session.event_seat_venues?.[0];
			if (venue?.image && venue.id > 0) {
				await uploadVenueImage(
					session.id.toString(),
					venue.id.toString(),
					venue.image,
				);
			}

			const request: BulkUpdateSeatSessionRequest = {
				name: session.name,
				status: session.status as BulkUpdateSeatSessionRequest["status"],
				location: session.location,
				start_datetime: session.start_datetime,
				end_datetime: session.end_datetime,
				event_seat_venues_attributes: session.event_seat_venues?.map(
					(v): BulkUpdateVenueAttributes => {
						const activeSections: BulkUpdateSectionAttributes[] =
							v.event_seat_sections?.map((s): BulkUpdateSectionAttributes => {
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

								for (const d of deletedSeatIds) {
									if (d.sectionId === s.id) {
										activeSeats.push({ id: d.seatId, _destroy: true });
									}
								}

								const activeGroups: BulkUpdateGroupAttributes[] = 
									s.event_seat_groups?.map((g): BulkUpdateGroupAttributes => {
										const groupSeats = s.event_ticket_seats?.filter(
											st => st.event_seat_group_assignment?.event_seat_group_id === g.id
										) || [];
										
										return {
											id: g.id > 0 ? g.id : undefined,
											name: g.name,
											extra_price: g.extra_price,
											color: g.color,
											event_seat_group_assignments_attributes: groupSeats.map(st => ({
												id: st.event_seat_group_assignment?.id && st.event_seat_group_assignment.id > 0 
													? st.event_seat_group_assignment.id 
													: undefined,
												event_ticket_seat_id: st.id
											}))
										};
									}) || [];
								
								for (const d of deletedGroupIds) {
									if (d.sectionId === s.id) {
										activeGroups.push({ id: d.groupId, _destroy: true });
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
									rotation: s.rotation,
									color: s.color,
									event_ticket_seats_attributes: activeSeats,
									event_seat_groups_attributes: activeGroups,
								};
							}) || [];

						for (const id of deletedSectionIds) {
							activeSections.push({ id, _destroy: true });
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

			set({
				session: updatedSession,
				isSaving: false,
				deletedSectionIds: [],
				deletedSeatIds: [],
				deletedGroupIds: [],
				hasUnsavedChanges: false,
			});
			if (typeof window !== "undefined") {
				localStorage.removeItem(seatSessionDraftKey(session.id));
			}
		} catch (e: unknown) {
			const errorMessage = e instanceof Error ? e.message : "Failed to save session";
			set({ error: errorMessage, isSaving: false });
		}
	},
}));
