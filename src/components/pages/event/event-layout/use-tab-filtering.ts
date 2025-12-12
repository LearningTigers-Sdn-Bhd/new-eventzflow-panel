import { useMemo } from "react";
import type { Event } from "@/lib/api/event";
import type { TabItem } from "./tab-config";
import { TAB_ITEMS } from "./tab-config";

type EventPermissions = {
	isExhibitionContractor: boolean;
	isEventVendor: boolean;
	canManageEventVendors: boolean;
	canManageEventStaff: boolean;
	canViewVendorsTab: boolean;
	canViewVisitorsTab: boolean;
};

export function useTabFiltering(
	currentEvent: Event | undefined,
	permissions: EventPermissions,
) {
	return useMemo(() => {
		return TAB_ITEMS.filter((tab) => {
			// For exhibition contractors, only show their specific tabs
			if (permissions.isExhibitionContractor) {
				return ["contractor-profile", "rentable-items", "printing-services"].includes(tab.id);
			}

			// For vendors, only show these specific tabs
			if (permissions.isEventVendor && !permissions.canManageEventVendors) {
				// Exhibitor kit tabs only available when enabled
				if (["my-items", "order-items", "custom-requests"].includes(tab.id)) {
					return currentEvent?.use_exhibitor_kit === true;
				}
				return [
					"vendors",
					"vouchers",
					"voucher-redemption",
					"voucher-analytics",
					"visitor-stamps",
				].includes(tab.id);
			}

			// Hide contractor-specific tabs from organizers and org_owners
			if (["contractor-profile", "rentable-items", "printing-services"].includes(tab.id)) {
				return permissions.isExhibitionContractor;
			}

			// Hide vendor-specific exhibitor kit tabs
			if (["my-items", "order-items", "custom-requests"].includes(tab.id)) {
				return permissions.isEventVendor && !permissions.canManageEventVendors && currentEvent?.use_exhibitor_kit === true;
			}

			// Always show these tabs
			if (["location", "lucky-draw"].includes(tab.id)) {
				return true;
			}

			// Export logs - hide for vendors and non-ticket events
			if (tab.id === "export-logs") {
				return currentEvent?.use_ticket !== false && !permissions.isEventVendor;
			}

			// Ticket-related tabs - only for ticket events
			if (["tickets", "pending-tickets", "scanned-logs", "ticket-types", "analytics"].includes(tab.id)) {
				return currentEvent?.use_ticket !== false;
			}

			// Mall live feed - only for non-ticket events
			if (tab.id === "mall-live-feed") {
				return currentEvent?.use_ticket === false;
			}

			// Event staff - only org_owner can manage
			if (tab.id === "event-staff") {
				return permissions.canManageEventStaff;
			}

			// Vendors tab - only visible when use_exhibitor_kit is false
			if (tab.id === "vendors") {
				return permissions.canViewVendorsTab && currentEvent?.use_exhibitor_kit !== true;
			}

			// Exhibitor tab - only visible when use_exhibitor_kit is enabled
			if (tab.id === "exhibitor") {
				return currentEvent?.use_exhibitor_kit === true && permissions.canViewVendorsTab;
			}

			// Exhibitor Contractor tab - only visible to org_owner
			if (tab.id === "exhibitor-contractor") {
				return permissions.canManageEventStaff;
			}

			// Vouchers tab - visible to event admins and vendors
			if (tab.id === "vouchers") {
				return permissions.canViewVendorsTab;
			}

			// Voucher redemption - only for vendors
			if (tab.id === "voucher-redemption") {
				return permissions.isEventVendor;
			}

			// Voucher analytics - only for vendors and event admins
			if (tab.id === "voucher-analytics") {
				return permissions.isEventVendor || permissions.canManageEventVendors;
			}

			// Voucher logs - only for event admins and staff
			if (tab.id === "voucher-logs") {
				return permissions.canManageEventVendors || permissions.canManageEventStaff;
			}

			// Stamp logs - only for event admins and staff, only for non-ticket events
			if (tab.id === "stamp-logs") {
				return (permissions.canManageEventVendors || permissions.canManageEventStaff) && currentEvent?.use_ticket === false;
			}

			// Visitors tab - only for non-ticket events
			if (tab.id === "visitors") {
				return permissions.canViewVisitorsTab;
			}

			// Stamp scanner - only for vendors
			if (tab.id === "visitor-stamps") {
				return permissions.isEventVendor;
			}

			return true;
		});
	}, [currentEvent?.use_ticket, currentEvent?.use_exhibitor_kit, permissions]);
}
