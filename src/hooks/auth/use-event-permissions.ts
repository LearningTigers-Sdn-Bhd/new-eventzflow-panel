import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getEventStaff } from "@/lib/api/event/event-staff";
import type { Event } from "@/lib/api/event/response";
import { getEventVendors } from "@/lib/api/event-vendor";
import { useAuth } from "./use-auth";

export type EventPermissions = {
	// Loading state
	isLoading: boolean;

	// Global permissions
	isOrgOwner: boolean;
	isOrganizer: boolean;
	isMember: boolean;
	isVendor: boolean;
	isExhibitionContractor: boolean;

	// Event-specific roles
	isEventAdmin: boolean;
	isEventTeamMember: boolean;
	isEventStaff: boolean;
	isEventVendor: boolean;
	isBusinessHost: boolean;
	isBusinessMatchingAdmin: boolean;

	// Specific permissions
	canManageEvent: boolean;
	canManageEventStaff: boolean;
	canManageEventVendors: boolean;
	canViewAnalytics: boolean;
	canManageTickets: boolean;
	canScanTickets: boolean;
	canViewVisitors: boolean;
	canScanVisitorStamps: boolean;
	canEditVendorProfile: boolean;
	canViewLeadAnalytics: boolean;
	// Business Matching admin actions (sessions, tags, hosts) — mirrors the
	// backend's manage_business_matching_sessions?/manage_business_hosts?
	canManageBusinessMatching: boolean;

	// Tab visibility
	canViewVendorsTab: boolean;
	canViewVisitorsTab: boolean;
	canViewLeadScannerTab: boolean;
};

/**
 * Hook to check event-specific permissions for the current user
 *
 * This hook determines what actions a user can perform on a specific event
 * based on their global role, event staff assignment, and vendor assignment.
 */
export function useEventPermissions(
	eventId: string | number,
	event?: Event,
): EventPermissions {
	const { user } = useAuth();
	const eventIdStr = String(eventId);

	// Check if user is an exhibition contractor
	const isExhibitionContractor = user?.role === "exhibition_contractor";
	const isExhibitor = user?.role === "exhibitor";

	// Determine which queries should run based on user role
	const shouldFetchStaff =
		!!user &&
		!!eventId &&
		user.role !== "vendor" &&
		!isExhibitor &&
		!isExhibitionContractor &&
		!!event;
	const shouldFetchVendors =
		!!user && !!eventId && !isExhibitor && !isExhibitionContractor && !!event;

	// Fetch event staff assignments (only for non-vendor and non-exhibition_contractor users)
	const { data: eventStaff, isLoading: isLoadingStaff } = useQuery({
		queryKey: ["event", eventIdStr, "staff"],
		queryFn: () => getEventStaff({ eventId: eventIdStr }),
		enabled: shouldFetchStaff,
		retry: false,
	});

	// Fetch event vendors to check if user is a vendor (not for exhibition contractors)
	const { data: eventVendors, isLoading: isLoadingVendors } = useQuery({
		queryKey: ["events", Number(eventId), "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
		enabled: shouldFetchVendors,
		retry: false,
	});

	const permissions = useMemo(() => {
		if (!user) {
			return {
				// Loading state
				isLoading: false,

				// Global permissions
				isOrgOwner: false,
				isOrganizer: false,
				isMember: false,
				isVendor: false,
				isExhibitionContractor: false,

				// Event-specific roles
				isEventAdmin: false,
				isEventTeamMember: false,
				isEventStaff: false,
				isEventVendor: false,
				isBusinessHost: false,
				isBusinessMatchingAdmin: false,

				// Specific permissions
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

				// Tab visibility
				canViewVendorsTab: false,
				canViewVisitorsTab: false,
				canViewLeadScannerTab: false,
			};
		}

		// Global roles
		const isOrgOwner = user.role === "org_owner";
		const isOrganizer = user.role === "organizer";
		const isMember = user.role === "member";
		const isVendor = user.role === "vendor";

		// For vendors and exhibition contractors, we can determine permissions immediately from global role
		// No need to wait for async queries
		if (isVendor || isExhibitionContractor) {
			// Determine if event uses tickets
			const useTicket = event?.use_ticket ?? true;

			return {
				// Loading state - no loading needed for vendors/contractors
				isLoading: false,

				// Global permissions
				isOrgOwner: false,
				isOrganizer: false,
				isMember: false,
				isVendor,
				isExhibitionContractor,

				// Event-specific roles
				isEventAdmin: false,
				isEventTeamMember: false,
				isEventStaff: false,
				isEventVendor: isVendor, // Vendor role means they're an event vendor
				isBusinessHost: false,
				isBusinessMatchingAdmin: false,

				// Specific permissions
				canManageEvent: false,
				canManageEventStaff: false,
				canManageEventVendors: false,
				canViewAnalytics: false,
				canManageTickets: false,
				canScanTickets: false,
				canViewVisitors: false,
				canScanVisitorStamps: isVendor, // Vendors can scan stamps
				canEditVendorProfile: isVendor,
				canViewLeadAnalytics: isVendor,
				canManageBusinessMatching: false,

				// Tab visibility
				canViewVendorsTab: isVendor,
				canViewVisitorsTab: false,
				canViewLeadScannerTab: !useTicket && isVendor,
			};
		}

		// For other roles (org_owner, organizer, member), we need to check event staff assignments
		// Determine if we're still loading critical data
		const isLoading =
			(shouldFetchStaff && isLoadingStaff) ||
			(shouldFetchVendors && isLoadingVendors);

		// Find user's event staff assignment
		const userStaffAssignment = eventStaff?.find(
			(staff) => String(staff.id) === String(user.id),
		);

		// Event-specific roles
		const isEventAdmin = userStaffAssignment?.eventRole === "event_admin";
		const isEventTeamMember =
			userStaffAssignment?.eventRole === "event_team_member";
		const isBusinessHost = user.role === "exhibitor" || userStaffAssignment?.eventRole === "business_host";
		const isBusinessMatchingAdmin =
			userStaffAssignment?.eventRole === "business_matching_admin";
		const isEventStaff = !!userStaffAssignment || user.role === "exhibitor";

		// Check if user is a vendor for this event
		const isEventVendor =
			eventVendors?.some((vendor) => vendor.vendor_id === user.id) ?? false;

		// Determine if event uses tickets
		const useTicket = event?.use_ticket ?? true;

		// Calculate specific permissions
		const canManageEvent = isOrgOwner || isEventAdmin;
		const canManageEventStaff = isOrgOwner || isOrganizer;
		const canManageEventVendors = isOrgOwner || isEventAdmin;
		const canViewAnalytics = isOrgOwner || isEventAdmin;
		const canManageTickets = isOrgOwner || isEventAdmin;
		const canScanTickets = isOrgOwner || isEventAdmin || isEventTeamMember;
		const canViewVisitors = isOrgOwner || isEventAdmin || isEventTeamMember;
		const canScanVisitorStamps = isOrgOwner || isEventAdmin || isEventVendor;
		const canEditVendorProfile = isEventVendor;
		const canViewLeadAnalytics = isEventVendor;
		// Matches the backend's manage_business_matching_sessions?/manage_business_hosts?
		const canManageBusinessMatching =
			isOrgOwner || isOrganizer || isEventAdmin || isEventTeamMember || isBusinessMatchingAdmin;

		// Tab visibility based on event type and permissions
		const canViewVendorsTab = canManageEventVendors || isEventVendor;
		const canViewVisitorsTab = !useTicket && canViewVisitors;
		const canViewLeadScannerTab = !useTicket && (canScanVisitorStamps ?? false);

		return {
			// Loading state
			isLoading,

			// Global permissions
			isOrgOwner,
			isOrganizer,
			isMember,
			isVendor,
			isExhibitionContractor,

			// Event-specific roles
			isEventAdmin,
			isEventTeamMember,
			isBusinessHost,
			isBusinessMatchingAdmin,
			isEventStaff,
			isEventVendor,
			// Specific permissions
			canManageEvent,
			canManageEventStaff,
			canManageEventVendors,
			canViewAnalytics,
			canManageTickets,
			canScanTickets,
			canViewVisitors,
			canScanVisitorStamps,
			canEditVendorProfile,
			canViewLeadAnalytics,
			canManageBusinessMatching,

			// Tab visibility
			canViewVendorsTab,
			canViewVisitorsTab,
			canViewLeadScannerTab,
		};
	}, [
		user,
		eventStaff,
		eventVendors,
		event?.use_ticket,
		isExhibitionContractor,
		isLoadingStaff,
		isLoadingVendors,
		shouldFetchStaff,
		shouldFetchVendors,
		event,
	]);

	return permissions;
}
