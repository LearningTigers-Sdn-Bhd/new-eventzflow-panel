"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
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
	const resetViewState = useSeatSessionStore((state) => state.resetViewState);
	const setSession = useSeatSessionStore((state) => state.setSession);
	const setDeletedSectionIds = useSeatSessionStore(
		(state) => state.setDeletedSectionIds,
	);
	const setDeletedSeatIds = useSeatSessionStore(
		(state) => state.setDeletedSeatIds,
	);
	const setHasUnsavedChanges = useSeatSessionStore(
		(state) => state.setHasUnsavedChanges,
	);
	const toastIdRef = useRef<number | string | null>(null);

	const saveDraft = useCallback((session: EventSeatSession) => {
		if (typeof window === "undefined") return;
		const state = useSeatSessionStore.getState();
		const draft = {
			session: sanitizeSession(session),
			deletedSectionIds: state.deletedSectionIds,
			deletedSeatIds: state.deletedSeatIds,
			savedAt: new Date().toISOString(),
		};
		localStorage.setItem(
			seatSessionDraftKey(session.id),
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
		const currentState = useSeatSessionStore.getState();
		const currentSession = currentState.session;
		if (currentSession && currentState.hasUnsavedChanges) {
			saveDraft(currentSession);
		}

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
					resetViewState();
					setSession(draft.session);
					setDeletedSectionIds(draft.deletedSectionIds);
					setDeletedSeatIds(draft.deletedSeatIds);
					setHasUnsavedChanges(true);
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
	}, [
		initializeSession,
		initialSession,
		resetViewState,
		setDeletedSectionIds,
		setDeletedSeatIds,
		setHasUnsavedChanges,
		setSession,
		saveDraft,
		loadDraft,
		discardDraft,
	]);

	useEffect(() => {
		return () => {
			const state = useSeatSessionStore.getState();
			if (state.session?.id && state.hasUnsavedChanges) {
				saveDraft(state.session);
			}
		};
	}, [saveDraft]);

	// Debounced auto-save draft
	const session = useSeatSessionStore((state) => state.session);
	const hasUnsavedChanges = useSeatSessionStore((state) => state.hasUnsavedChanges);

	useEffect(() => {
		if (!session || !hasUnsavedChanges) return;

		const timeoutId = setTimeout(() => {
			saveDraft(session);
		}, 2000); // Save after 2 seconds of inactivity

		return () => clearTimeout(timeoutId);
	}, [session, hasUnsavedChanges, saveDraft]);

	return <>{children}</>;
}

interface SeatSessionDraft {
	session: EventSeatSession;
	deletedSectionIds: number[];
	deletedSeatIds: { seatId: number; sectionId: number }[];
	savedAt: string;
}

function sanitizeSession(session: EventSeatSession): EventSeatSession {
	return {
		...session,
		event_seat_venues: session.event_seat_venues?.map((venue) => ({
			...venue,
			image: null,
			event_seat_sections: venue.event_seat_sections?.map((section) => ({
				...section,
				event_ticket_seats: section.event_ticket_seats?.map((seat) => ({
					...seat,
				})),
			})),
		})),
	};
}
