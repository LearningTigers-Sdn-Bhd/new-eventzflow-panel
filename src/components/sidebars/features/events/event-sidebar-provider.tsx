"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { getEventSidebarContext } from "@/lib/api/event";
import type {
	EventPermissions,
	EventSidebarEvent,
} from "@/lib/api/event/response";

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface EventSidebarContextValue {
	/** Event ID from URL params */
	eventId: string | undefined;
	/** All events for the user */
	events: EventSidebarEvent[] | undefined;
	/** Currently selected event */
	currentEvent: EventSidebarEvent | undefined;
	/** Event permissions */
	permissions: EventPermissions;
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

const EMPTY_PERMISSIONS: EventPermissions = {
	isLoading: false,
	isOrgOwner: false,
	isOrganizer: false,
	isMember: false,
	isVendor: false,
	isExhibitionContractor: false,
	isEventAdmin: false,
	isEventTeamMember: false,
	isEventStaff: false,
	isEventVendor: false,
	isBusinessHost: false,
	isBusinessMatchingAdmin: false,
	canManageEvent: false,
	canManageEventStaff: false,
	canManageEventVendors: false,
	canViewAnalytics: false,
	canManageTickets: false,
	canScanTickets: false,
	canViewVisitors: false,
	canScanVisitorStamps: false,
	canEditVendorProfile: false,
	canViewLeadAnalytics: false,
	canManageBusinessMatching: false,
	canViewVendorsTab: false,
	canViewVisitorsTab: false,
	canViewLeadScannerTab: false,
};

export function EventSidebarProvider({ children }: EventSidebarProviderProps) {
	// Get event ID from URL params
	const params = useParams();
	const eventId = params.event_id as string | undefined;

	const { data, isLoading } = useQuery({
		queryKey: ["event", eventId, "sidebar-context"],
		queryFn: () => getEventSidebarContext(eventId as string),
		enabled: !!eventId,
		staleTime: 60_000,
	});
	const events = data?.events;
	const currentEvent = data?.currentEvent;
	const permissions = data?.permissions ?? EMPTY_PERMISSIONS;

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
