import { toast } from "sonner";
import { create } from "zustand";
import {
	getSectionSeats,
	updateSeatSessionBlueprint,
	uploadVenueImage,
} from "@/lib/api/seat-ticketing/endpoints";
import type {
	BulkUpdateGroupAttributes,
	BulkUpdateSeatAttributes,
	BulkUpdateSeatSessionRequest,
	BulkUpdateSectionAttributes,
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

// Normalized state structure
interface SeatSessionState {
	session: Omit<EventSeatSession, "event_seat_venues"> | null;
	venue: EventSeatVenue | null;
	sections: Record<number, EventSeatSection>;
	seats: Record<number, EventTicketSeat>;
	hydratingSectionIds: number[];

	// Track section IDs order for rendering
	sectionIds: number[];

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
	setHasUnsavedChanges: (value: boolean) => void;
	setMode: (mode: EditorMode) => void;
	setInteractionMode: (mode: InteractionMode) => void;
	setIsPanning: (isPanning: boolean) => void;
	setZoom: (zoom: number) => void;
	setPan: (pan: { x: number; y: number }) => void;

	selectSection: (id: number | null) => void;
	selectSeat: (id: number | null) => void;
	selectSeats: (ids: number[]) => void;
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
	hydrateSectionSeats: (sectionId: number) => Promise<void>;

	// Group Actions
	addGroup: (
		sectionId: number,
		group: { name: string; extra_price: number },
	) => void;
	updateGroup: (
		sectionId: number,
		groupId: number,
		data: Partial<EventSeatGroup>,
	) => void;
	removeGroup: (sectionId: number, groupId: number) => void;
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
	addSeats: (
		sectionId: number,
		seats: Omit<
			EventTicketSeat,
			| "id"
			| "event_seat_section_id"
			| "created_at"
			| "updated_at"
			| "visitor_id"
			| "locked_at"
			| "locked_by_session_id"
			| "status"
		>[],
	) => void;
	updateSeat: (id: number, data: Partial<EventTicketSeat>) => void;
	removeSeat: (id: number) => void;
	clearSectionSeats: (sectionId: number) => void;

	// Persistence
	save: () => Promise<void>;
}

export const useSeatSessionStore = create<SeatSessionState>((set, get) => ({
	session: null,
	venue: null,
	sections: {},
	seats: {},
	sectionIds: [],
	hydratingSectionIds: [],

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
		const sections: Record<number, EventSeatSection> = {};
		const sectionIds: number[] = [];
		const seats: Record<number, EventTicketSeat> = {};

		const venues = session.event_seat_venues || [];
		let activeVenue: EventSeatVenue | null = venues[0] || null;

		if (!activeVenue) {
			const tempId = -Math.floor(Math.random() * 1000000);
			activeVenue = {
				id: tempId,
				event_seat_session_id: session.id,
				name: "Main Venue",
				total_row: 20,
				total_column: 20,
				aspect_ratio: "square",
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				event_seat_sections: [],
			};
		}

		activeVenue.event_seat_sections?.forEach((section) => {
			sections[section.id] = section;
			sectionIds.push(section.id);
			section.event_ticket_seats?.forEach((seat) => {
				seats[seat.id] = seat;
			});
		});

		const { event_seat_venues, ...sessionData } = session;

		set({
			session: sessionData,
			venue: activeVenue,
			sections,
			sectionIds,
			seats,
			error: null,
		});
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
			selectedSeatPosition: null,
		}),
	selectSeats: (ids) =>
		set({
			selectedSeatIds: ids,
			selectedSeatId: ids.length === 1 ? ids[0] : null,
			selectedGroupId: null,
			selectedSeatPosition: null,
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
				selectedSeatPosition: null,
			};
		});
	},
	selectGroup: (id) =>
		set({
			selectedGroupId: id,
			selectedSeatId: null,
			selectedSeatIds: [],
			selectedSeatPosition: null,
		}),
	setGroupPaintingMode: (groupId) =>
		set({
			activeGroupId: groupId,
			interactionMode: groupId ? "select" : get().interactionMode,
		}),
	selectSeatPosition: (position) =>
		set({
			selectedSeatPosition: position,
			selectedSeatId: null,
			selectedSeatIds: [],
			selectedGroupId: null,
		}),

	updateVenue: (data) => {
		set((state) => ({
			venue: state.venue ? { ...state.venue, ...data } : null,
			hasUnsavedChanges: true,
		}));
	},

	addSection: (sectionData) => {
		const { venue, sectionIds, sections } = get();
		if (!venue) return;

		const tempId = -Math.floor(Math.random() * 1000000);
		const newSection: EventSeatSection = {
			...sectionData,
			rotation: sectionData.rotation ?? 0,
			color: "blue",
			id: tempId,
			event_seat_venue_id: venue.id,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			event_ticket_seats: [],
			event_seat_groups: [],
		};

		set({
			sections: { ...sections, [tempId]: newSection },
			sectionIds: [...sectionIds, tempId],
			selectedSectionId: tempId,
			hasUnsavedChanges: true,
		});
	},

	updateSection: (id, data) => {
		set((state) => ({
			sections: {
				...state.sections,
				[id]: { ...state.sections[id], ...data },
			},
			hasUnsavedChanges: true,
		}));
	},

	removeSection: (id) => {
		set((state) => {
			const newSections = { ...state.sections };
			delete newSections[id];

			const deletedIds = [...state.deletedSectionIds];
			if (id > 0) deletedIds.push(id);

			return {
				sections: newSections,
				sectionIds: state.sectionIds.filter((sid) => sid !== id),
				selectedSectionId:
					state.selectedSectionId === id ? null : state.selectedSectionId,
				deletedSectionIds: deletedIds,
				hasUnsavedChanges: true,
			};
		});
	},

	hydrateSectionSeats: async (sectionId) => {
		const { session, venue } = get();
		if (!session || !venue) return;

		set((state) => ({
			hydratingSectionIds: [...state.hydratingSectionIds, sectionId],
		}));

		try {
			const seatsData = await getSectionSeats(
				session.id.toString(),
				venue.id.toString(),
				sectionId.toString(),
			);

			set((state) => {
				const newSeats = { ...state.seats };
				const deletedIds = state.deletedSeatIds.map((d) => d.seatId);

				seatsData.forEach((seat: EventTicketSeat) => {
					// Only add back if not in the deleted list
					if (!deletedIds.includes(seat.id)) {
						newSeats[seat.id] = seat;
					}
				});

				const section = state.sections[sectionId];
				return {
					seats: newSeats,
					sections: {
						...state.sections,
						[sectionId]: {
							...section,
							event_ticket_seats: seatsData.filter(
								(s) => !deletedIds.includes(s.id),
							),
						},
					},
					hydratingSectionIds: state.hydratingSectionIds.filter(
						(id) => id !== sectionId,
					),
				};
			});
		} catch (e) {
			console.error("Failed to hydrate seats", e);
			set((state) => ({
				hydratingSectionIds: state.hydratingSectionIds.filter(
					(id) => id !== sectionId,
				),
			}));
		}
	},

	addGroup: (sectionId, groupData) => {
		set((state) => {
			const section = state.sections[sectionId];
			if (!section) return state;

			const tempId = -Math.floor(Math.random() * 1000000);
			const newGroup: EventSeatGroup = {
				...groupData,
				color: "green",
				id: tempId,
				event_seat_section_id: sectionId,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			const newGroups = [...(section.event_seat_groups || []), newGroup];

			return {
				sections: {
					...state.sections,
					[sectionId]: { ...section, event_seat_groups: newGroups },
				},
				hasUnsavedChanges: true,
			};
		});
	},

	updateGroup: (sectionId, groupId, data) => {
		set((state) => {
			const section = state.sections[sectionId];
			if (!section) return state;

			const newGroups = section.event_seat_groups?.map((g) =>
				g.id === groupId ? { ...g, ...data } : g,
			);

			return {
				sections: {
					...state.sections,
					[sectionId]: { ...section, event_seat_groups: newGroups },
				},
				hasUnsavedChanges: true,
			};
		});
	},

	removeGroup: (sectionId, groupId) => {
		set((state) => {
			const section = state.sections[sectionId];
			if (!section) return state;

			const deletedIds = [...state.deletedGroupIds];
			if (groupId > 0) deletedIds.push({ groupId, sectionId });

			const newGroups = section.event_seat_groups?.filter(
				(g) => g.id !== groupId,
			);

			// Also clear assignments in the flat seats map
			const newSeats = { ...state.seats };
			Object.keys(newSeats).forEach((id) => {
				const seat = newSeats[Number(id)];
				if (
					seat.event_seat_section_id === sectionId &&
					seat.event_seat_group_assignment?.event_seat_group_id === groupId
				) {
					newSeats[Number(id)] = { ...seat, event_seat_group_assignment: null };
				}
			});

			return {
				sections: {
					...state.sections,
					[sectionId]: { ...section, event_seat_groups: newGroups },
				},
				seats: newSeats,
				selectedGroupId:
					state.selectedGroupId === groupId ? null : state.selectedGroupId,
				deletedGroupIds: deletedIds,
				hasUnsavedChanges: true,
			};
		});
	},

	assignSeatsToGroup: (seatIds, groupId) => {
		set((state) => {
			const newSeats = { ...state.seats };
			seatIds.forEach((id) => {
				const seat = newSeats[id];
				if (!seat) return;

				if (groupId === null) {
					newSeats[id] = { ...seat, event_seat_group_assignment: null };
				} else {
					const assignment: EventSeatGroupAssignment = {
						id:
							seat.event_seat_group_assignment?.id ||
							-Math.floor(Math.random() * 1000000),
						event_seat_group_id: groupId,
						event_ticket_seat_id: id,
					};
					newSeats[id] = { ...seat, event_seat_group_assignment: assignment };
				}
			});

			return {
				seats: newSeats,
				hasUnsavedChanges: true,
			};
		});
	},

	addSeat: (sectionId, seatData) => {
		set((state) => {
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

			const section = state.sections[sectionId];
			const newSection = section
				? {
						...section,
						seats_count: (section.seats_count || 0) + 1,
					}
				: null;

			return {
				seats: { ...state.seats, [tempId]: newSeat },
				sections: newSection
					? { ...state.sections, [sectionId]: newSection }
					: state.sections,
				hasUnsavedChanges: true,
			};
		});
	},

	addSeats: (sectionId, seatsData) => {
		set((state) => {
			const newSeats = { ...state.seats };
			seatsData.forEach((sd) => {
				const tempId = -Math.floor(Math.random() * 1000000000);
				newSeats[tempId] = {
					...sd,
					id: tempId,
					event_seat_section_id: sectionId,
					visitor_id: null,
					locked_at: null,
					locked_by_session_id: null,
					status: "available",
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
			});

			const section = state.sections[sectionId];
			const newSection = section
				? {
						...section,
						seats_count: (section.seats_count || 0) + seatsData.length,
					}
				: null;

			return {
				seats: newSeats,
				sections: newSection
					? { ...state.sections, [sectionId]: newSection }
					: state.sections,
				hasUnsavedChanges: true,
			};
		});
	},

	updateSeat: (id, data) => {
		set((state) => ({
			seats: {
				...state.seats,
				[id]: { ...state.seats[id], ...data },
			},
			hasUnsavedChanges: true,
		}));
	},

	removeSeat: (id) => {
		set((state) => {
			const seat = state.seats[id];
			if (!seat) return state;

			const newSeats = { ...state.seats };
			delete newSeats[id];

			const deletedIds = [...state.deletedSeatIds];
			if (id > 0) {
				deletedIds.push({ seatId: id, sectionId: seat.event_seat_section_id });
			}

			const section = state.sections[seat.event_seat_section_id];
			const newSection = section
				? {
						...section,
						seats_count: Math.max(0, (section.seats_count || 0) - 1),
					}
				: null;

			return {
				seats: newSeats,
				sections: newSection
					? { ...state.sections, [seat.event_seat_section_id]: newSection }
					: state.sections,
				selectedSeatId:
					state.selectedSeatId === id ? null : state.selectedSeatId,
				deletedSeatIds: deletedIds,
				hasUnsavedChanges: true,
			};
		});
	},

	clearSectionSeats: (sectionId) => {
		set((state) => {
			const newSeats = { ...state.seats };
			const deletedIds = [...state.deletedSeatIds];

			Object.values(state.seats).forEach((seat) => {
				if (seat.event_seat_section_id === sectionId) {
					delete newSeats[seat.id];
					if (seat.id > 0) {
						deletedIds.push({ seatId: seat.id, sectionId });
					}
				}
			});

			const section = state.sections[sectionId];
			const newSection = section ? { ...section, seats_count: 0 } : null;

			return {
				seats: newSeats,
				sections: newSection
					? { ...state.sections, [sectionId]: newSection }
					: state.sections,
				deletedSeatIds: deletedIds,
				selectedSeatId: null,
				selectedSeatIds: [],
				hasUnsavedChanges: true,
			};
		});
	},

	save: async () => {
		const {
			session,
			venue,
			sections,
			sectionIds,
			seats,
			deletedSectionIds,
			deletedSeatIds,
			deletedGroupIds,
		} = get();
		if (!session || !venue) return;

		set({ isSaving: true, error: null });
		try {
			if (venue.image && venue.id > 0) {
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
				event_seat_venues_attributes: [
					{
						id: venue.id > 0 ? venue.id : undefined,
						name: venue.name,
						total_row: venue.total_row,
						total_column: venue.total_column,
						aspect_ratio: venue.aspect_ratio,
						event_seat_sections_attributes: [
							...sectionIds.map((sid): BulkUpdateSectionAttributes => {
								const s = sections[sid];
								const sectionSeats = Object.values(seats).filter(
									(st) => st.event_seat_section_id === sid,
								);

								const activeSeats: BulkUpdateSeatAttributes[] =
									sectionSeats.map((st) => ({
										id: st.id > 0 ? st.id : undefined,
										name: st.name,
										extra_price: st.extra_price,
										row_set: st.row_set,
										col_set: st.col_set,
										ticket_id: st.ticket_id,
									}));

								deletedSeatIds
									.filter((d) => d.sectionId === sid)
									.forEach((d) => {
										activeSeats.push({ id: d.seatId, _destroy: true });
									});

								const activeGroups: BulkUpdateGroupAttributes[] = (
									s.event_seat_groups || []
								).map((g) => {
									const groupSeats = sectionSeats.filter(
										(st) =>
											st.event_seat_group_assignment?.event_seat_group_id ===
											g.id,
									);
									return {
										id: g.id > 0 ? g.id : undefined,
										name: g.name,
										extra_price: g.extra_price,
										color: g.color,
										event_seat_group_assignments_attributes: groupSeats.map(
											(st) => ({
												id:
													st.event_seat_group_assignment?.id &&
													st.event_seat_group_assignment.id > 0
														? st.event_seat_group_assignment.id
														: undefined,
												event_ticket_seat_id: st.id,
											}),
										),
									};
								});

								deletedGroupIds
									.filter((d) => d.sectionId === sid)
									.forEach((d) => {
										activeGroups.push({ id: d.groupId, _destroy: true });
									});

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
									blueprint_config: s.blueprint_config,
									event_ticket_seats_attributes: activeSeats,
									event_seat_groups_attributes: activeGroups,
								};
							}),
							...deletedSectionIds.map((id) => ({
								id,
								_destroy: true as const,
							})),
						],
					},
				],
			};

			const updatedSession = await updateSeatSessionBlueprint(
				session.id.toString(),
				request,
			);
			get().setSession(updatedSession);
			set({
				isSaving: false,
				deletedSectionIds: [],
				deletedSeatIds: [],
				deletedGroupIds: [],
				hasUnsavedChanges: false,
			});

			toast.success("Venue plan updated successfully", {
				description: "All changes have been saved to the database.",
			});

			if (typeof window !== "undefined") {
				localStorage.removeItem(seatSessionDraftKey(session.id));
			}
		} catch (e: unknown) {
			const errorMessage =
				e instanceof Error ? e.message : "Failed to save session";
			set({ error: errorMessage, isSaving: false });

			toast.error("Failed to save plan", {
				description: errorMessage,
			});
		}
	},
}));
