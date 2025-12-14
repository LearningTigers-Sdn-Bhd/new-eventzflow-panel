import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getEventStaff } from "@/lib/api/event/event-staff";
import type { Event } from "@/lib/api/event/response";
import { getEventVendors } from "@/lib/api/event-vendor";
import { useAuth } from "./use-auth";

export type EventPermissions = {
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
	canViewStampAnalytics: boolean;

	// Tab visibility
	canViewVendorsTab: boolean;
	canViewVisitorsTab: boolean;
	canViewStampScannerTab: boolean;
};

/**
 * Hook to check event-specific permissions for the current user
 *
 * This hook determines what actions a user can perform on a specific event
 * based on their global role, event staff assignment, and vendor assignment.
 */
export function useEventPermissions(eventId: string | number, event?: Event): EventPermissions {
	const { user } = useAuth();
	const eventIdStr = String(eventId);

	// Check if user is an exhibition contractor
	const isExhibitionContractor = user?.role === "exhibition_contractor";

	// Fetch event staff assignments (only for non-vendor and non-exhibition_contractor users)
	const { data: eventStaff } = useQuery({
		queryKey: ["event", eventIdStr, "staff"],
		queryFn: () => getEventStaff({ eventId: eventIdStr }),
		enabled: !!user && !!eventId && user.role !== "vendor" && !isExhibitionContractor && !!event,
		retry: false,
	});

	// Fetch event vendors to check if user is a vendor (not for exhibition contractors)
	const { data: eventVendors } = useQuery({
		queryKey: ["events", Number(eventId), "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
		enabled: !!user && !!eventId && !isExhibitionContractor && !!event,
		retry: false,
	});

	const permissions = useMemo(() => {
		if (!user) {
			return {
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
				canViewStampAnalytics: false,

				// Tab visibility
				canViewVendorsTab: false,
				canViewVisitorsTab: false,
				canViewStampScannerTab: false,
			};
		}

		// Global roles
		const isOrgOwner = user.role === "org_owner";
		const isOrganizer = user.role === "organizer";
		const isMember = user.role === "member";
		const isVendor = user.role === "vendor";

		// Find user's event staff assignment
		const userStaffAssignment = eventStaff?.find(
			(staff) => String(staff.id) === String(user.id),
		);

		// Event-specific roles
		const isEventAdmin = userStaffAssignment?.eventRole === "event_admin";
		const isEventTeamMember =
			userStaffAssignment?.eventRole === "event_team_member";
		const isEventStaff = !!userStaffAssignment;

		// Check if user is a vendor for this event
		const isEventVendor = eventVendors?.some(
			(vendor) => vendor.vendor_id === user.id,
		) ?? false;

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
		const canViewStampAnalytics = isEventVendor;

		// Tab visibility based on event type and permissions
		const canViewVendorsTab = canManageEventVendors || isEventVendor;
		const canViewVisitorsTab = !useTicket && canViewVisitors;
		const canViewStampScannerTab = !useTicket && (canScanVisitorStamps ?? false);

		return {
			// Global permissions
			isOrgOwner,
			isOrganizer,
			isMember,
			isVendor,
			isExhibitionContractor,

			// Event-specific roles
			isEventAdmin,
			isEventTeamMember,
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
			canViewStampAnalytics,

			// Tab visibility
			canViewVendorsTab,
			canViewVisitorsTab,
			canViewStampScannerTab,
		};
	}, [user, eventStaff, eventVendors, event?.use_ticket, isExhibitionContractor]);

	return permissions;
}
