"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type {
	EventSeatSection,
	EventSeatSession,
	EventSeatVenue,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";
import {
	seatSessionDraftKey,
	useSeatSessionStore,
} from "./use-seat-session-store";

interface SeatSessionProviderProps {
	children: ReactNode;
	initialSession: EventSeatSession;
}

export function SeatSessionProvider({
	children,
	initialSession,
}: SeatSessionProviderProps) {
	const initializeSession = useSeatSessionStore(
		(state) => state.initializeSession,
	);
	const toastIdRef = useRef<number | string | null>(null);

	const saveDraft = useCallback(() => {
		if (typeof window === "undefined") return;
		const state = useSeatSessionStore.getState();
		if (!state.session) return;

		const draft: SeatSessionDraft = {
			session: state.session,
			venue: state.venue,
			sections: state.sections,
			sectionIds: state.sectionIds,
			seats: state.seats,
			deletedSectionIds: state.deletedSectionIds,
			deletedSeatIds: state.deletedSeatIds,
			deletedGroupIds: state.deletedGroupIds,
			savedAt: new Date().toISOString(),
		};
		localStorage.setItem(
			seatSessionDraftKey(state.session.id),
			JSON.stringify(draft),
		);
	}, []);

	const loadDraft = useCallback((sessionId: number) => {
		if (typeof window === "undefined") return null;
		const raw = localStorage.getItem(seatSessionDraftKey(sessionId));
		if (!raw) return null;
		try {
			return JSON.parse(raw) as SeatSessionDraft;
		} catch {
			return null;
		}
	}, []);

	const discardDraft = useCallback((sessionId: number) => {
		if (typeof window === "undefined") return;
		localStorage.removeItem(seatSessionDraftKey(sessionId));
	}, []);

	useEffect(() => {
		initializeSession(initialSession);

		if (toastIdRef.current) {
			toast.dismiss(toastIdRef.current);
			toastIdRef.current = null;
		}

		const draft = loadDraft(initialSession.id);
		if (!draft) return;

		const toastId = toast.info("Unsaved changes found for this session.", {
			description: "Restore your draft or discard it.",
			duration: Number.POSITIVE_INFINITY,
			action: {
				label: "Restore",
				onClick: () => {
					useSeatSessionStore.setState({
						session: draft.session,
						venue: draft.venue,
						sections: draft.sections,
						sectionIds: draft.sectionIds,
						seats: draft.seats,
						deletedSectionIds: draft.deletedSectionIds,
						deletedSeatIds: draft.deletedSeatIds,
						deletedGroupIds: draft.deletedGroupIds,
						hasUnsavedChanges: true,
					});
					discardDraft(initialSession.id);
					toast.dismiss(toastId);
					toastIdRef.current = null;
				},
			},
			cancel: {
				label: "Discard",
				onClick: () => {
					discardDraft(initialSession.id);
					toast.dismiss(toastId);
					toastIdRef.current = null;
				},
			},
		});

		toastIdRef.current = toastId;
	}, [initializeSession, initialSession, loadDraft, discardDraft]);

	// Debounced auto-save draft
	const hasUnsavedChanges = useSeatSessionStore((state) => state.hasUnsavedChanges);
	const session = useSeatSessionStore((state) => state.session);

	useEffect(() => {
		if (!hasUnsavedChanges || !session) return;

		const timeoutId = setTimeout(() => {
			saveDraft();
		}, 2000);

		return () => clearTimeout(timeoutId);
	}, [hasUnsavedChanges, session, saveDraft]);

	return <>{children}</>;
}

interface SeatSessionDraft {
	session: Omit<EventSeatSession, "event_seat_venues"> | null;
	venue: EventSeatVenue | null;
	sections: Record<number, EventSeatSection>;
	seats: Record<number, EventTicketSeat>;
	sectionIds: number[];
	deletedSectionIds: number[];
	deletedSeatIds: { seatId: number; sectionId: number }[];
	deletedGroupIds: { groupId: number; sectionId: number }[];
	savedAt: string;
}