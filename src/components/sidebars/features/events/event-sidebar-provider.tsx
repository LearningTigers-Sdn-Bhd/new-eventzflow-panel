"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { getEvents } from "@/lib/api/event";
import type { Event } from "@/lib/api/event/response";

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface EventSidebarContextValue {
	/** Event ID from URL params */
	eventId: string | undefined;
	/** All events for the user */
	events: Event[] | undefined;
	/** Currently selected event */
	currentEvent: Event | undefined;
	/** Event permissions */
	permissions: ReturnType<typeof useEventPermissions>;
	/** Loading state */
	isLoading: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const EventSidebarContext = createContext<EventSidebarContextValue | null>(
	null,
);

// ============================================================================
// HOOK
// ============================================================================

export function useEventSidebarContext() {
	const context = useContext(EventSidebarContext);
	if (!context) {
		throw new Error(
			"useEventSidebarContext must be used within an EventSidebarProvider",
		);
	}
	return context;
}

/** Safe version that returns null when not inside EventSidebarProvider */
/** For note: added this to make it work with the new breadcrumb feature */
export function useEventSidebarContextSafe() {
	return useContext(EventSidebarContext);
}

// ============================================================================
// PROVIDER
// ============================================================================

interface EventSidebarProviderProps {
	children: ReactNode;
}

export function EventSidebarProvider({ children }: EventSidebarProviderProps) {
	// Get event ID from URL params
	const params = useParams();
	const eventId = params.event_id as string | undefined;

	// Fetch events
	const { data: events, isLoading: isLoadingEvents } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});

	// Get current event
	const currentEvent = useMemo(() => {
		return events?.find((event) => event.id.toString() === eventId);
	}, [events, eventId]);

	// Get permissions
	const permissions = useEventPermissions(eventId ?? "", currentEvent);

	// Combined loading state
	const isLoading = isLoadingEvents || permissions.isLoading;

	const value = useMemo<EventSidebarContextValue>(
		() => ({
			eventId,
			events,
			currentEvent,
			permissions,
			isLoading,
		}),
		[eventId, events, currentEvent, permissions, isLoading],
	);

	return (
		<EventSidebarContext.Provider value={value}>
			{children}
		</EventSidebarContext.Provider>
	);
}
