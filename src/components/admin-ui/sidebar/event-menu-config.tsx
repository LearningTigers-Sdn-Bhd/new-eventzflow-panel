/**
 * Event Menu Configuration
 *
 * Defines all navigation tabs for event detail pages.
 * Tabs are organized into standalone items and groups.
 *
 * Visibility is controlled by:
 * - Event type (ticket-based vs mall/non-ticket)
 * - User permissions (org owner, event staff, vendor)
 * - Event settings (use_exhibitor_kit, etc.)
 */

import {
	Building2,
	ChartBar,
	Gift,
	HardHat,
	Info,
	Logs,
	MapPin,
	ScanQrCode,
	Ticket,
	TrendingUp,
	User,
	UserCheck,
	Users,
} from "lucide-react";
import type { IconType } from "react-icons";
import { HiTicket } from "react-icons/hi2";
import { TbClockDollar } from "react-icons/tb";
import type { useEventPermissions } from "@/hooks/use-event-permissions";
import type { Event } from "@/lib/api/event/response";

// ============================================================================
// TYPES
// ============================================================================

type Permissions = ReturnType<typeof useEventPermissions>;

export type MenuItem = {
	route: string;
	label: string;
	description: string;
	icon: IconType;
	visible?: (permissions: Permissions, event?: Event) => boolean;
};

export type MenuGroup = {
	id: string;
	label: string;
	icon: IconType;
	visible?: (permissions: Permissions, event?: Event) => boolean;
	tabs: MenuItem[];
};

export type EventMenuConfig = {
	standalone: MenuItem[];
	groups: MenuGroup[];
};

// ============================================================================
// VISIBILITY HELPERS - Reusable permission checks
// ============================================================================

const visible = {
	// Event type checks
	ticketEvent: (_p: Permissions, e?: Event) => e?.use_ticket !== false,
	mallEvent: (_p: Permissions, e?: Event) => e?.use_ticket === false,

	// Permission checks
	orgOwner: (p: Permissions) => p.canManageEventStaff ?? false,
	eventAdmin: (p: Permissions) =>
		(p.canManageEventVendors ?? false) || (p.canManageEventStaff ?? false),
	eventAdminOnly: (p: Permissions) => p.canManageEventVendors ?? false,
	vendor: (p: Permissions) => p.isEventVendor ?? false,
	canViewVendors: (p: Permissions) => p.canViewVendorsTab ?? false,
	canViewVisitors: (p: Permissions) => p.canViewVisitorsTab ?? false,

	// Combined checks
	vendorOrAdmin: (p: Permissions) =>
		(p.isEventVendor ?? false) || (p.canManageEventVendors ?? false),
	adminOnly: (p: Permissions) =>
		!(p.isEventVendor ?? false) || (p.canManageEventVendors ?? false),

	// Feature flags
	hasExhibitorKit: (_p: Permissions, e?: Event) =>
		e?.use_exhibitor_kit === true,
	hasVendors: (_p: Permissions, e?: Event) => e?.use_exhibitor_kit !== true,

	// Special access
	luckyDrawAccess: (p: Permissions) =>
		p.isEventAdmin || p.isOrganizer || p.isEventStaff,
	exhibitorContractorAccess: (p: Permissions, e?: Event) =>
		(visible.orgOwner(p) || p.isExhibitionContractor) &&
		visible.hasExhibitorKit(p, e),
};

// ============================================================================
// MENU CONFIGURATION
// ============================================================================

export const eventMenuConfig: EventMenuConfig = {
	/** Tabs that are always visible to all users */
	standalone: [
		{
			route: "details",
			label: "Event Details",
			description: "View and manage event details and information.",
			icon: Info,
		},
		{
			route: "location",
			label: "Location",
			description: "View event location details and map.",
			icon: MapPin,
			visible: (p) =>
				!(p.isEventVendor ?? false) && !(p.isExhibitionContractor ?? false),
		},
		{
			route: "lucky-draw",
			label: "Lucky Draw",
			description: "Manage lucky draw sessions, configurations, and prizes.",
			icon: Gift,
			visible: visible.luckyDrawAccess,
		},
		{
			route: "my-profile",
			label: "Vendor Profile",
			description: "Manage your vendor profile and settings.",
			icon: User,
			visible: visible.vendor,
		},
	],

	/** Grouped tabs with conditional visibility */
	groups: [
		// ------------------------------------------------------------------------
		// TICKETS GROUP - Only for ticket-based events
		// ------------------------------------------------------------------------
		{
			id: "tickets",
			label: "Tickets",
			icon: HiTicket,
			visible: visible.ticketEvent,
			tabs: [
				{
					route: "tickets",
					label: "Manage Tickets",
					description: "Manage ticket sales and attendee information.",
					icon: HiTicket,
				},
				{
					route: "pending-tickets",
					label: "Pending Tickets",
					description: "View and approve pending ticket transactions.",
					icon: TbClockDollar,
				},
				{
					route: "scanned-logs",
					label: "Scanned Logs",
					description: "View QR code scan logs and entry records.",
					icon: ScanQrCode,
				},
				{
					route: "ticket-types",
					label: "Ticket Types",
					description: "Manage ticket types for this event.",
					icon: HiTicket,
				},
			],
		},

		// ------------------------------------------------------------------------
		// PEOPLE GROUP - Staff, visitors, vendors
		// ------------------------------------------------------------------------
		{
			id: "people",
			label: "People",
			icon: Users,
			tabs: [
				// Visitors - mall events only, with view permission
				{
					route: "visitors",
					label: "Visitors",
					description: "Manage visitors for non-ticket events.",
					icon: UserCheck,
					visible: (p, e) =>
						visible.mallEvent(p, e) && visible.canViewVisitors(p),
				},
				// Event Staff - org owner only
				{
					route: "event-staff",
					label: "Event Staff",
					description: "Manage event staff assignments and permissions.",
					icon: Users,
					visible: visible.orgOwner,
				},
				// Vendors OR Exhibitor (mutually exclusive based on event settings)
				{
					route: "vendors",
					label: "Vendors",
					description: "View and manage vendors for this event.",
					icon: Building2,
					visible: (p, e) =>
						visible.canViewVendors(p) && visible.hasVendors(p, e),
				},
				{
					route: "exhibitor",
					label: "Exhibitor",
					description:
						"View and manage exhibitors and their kits for this event.",
					icon: Building2,
					visible: (p, e) =>
						visible.canViewVendors(p) &&
						visible.hasExhibitorKit(p, e) &&
						!visible.vendor(p),
				},
				// Exhibitor Contractor - org owner only, when using exhibitor kit
				{
					route: "exhibitor-contractor",
					label: "Exhibitor Contractor",
					description:
						"Assign and manage exhibitor contractors for this event.",
					icon: HardHat,
					visible: visible.exhibitorContractorAccess,
				},
			],
		},

		// ------------------------------------------------------------------------
		// ANALYTICS GROUP - Insights and metrics
		// ------------------------------------------------------------------------
		{
			id: "analytics",
			label: "Analytics",
			icon: ChartBar,
			tabs: [
				{
					route: "analytics",
					label: "Ticket Analytics",
					description: "View event analytics, charts, and insights.",
					icon: ChartBar,
					visible: visible.ticketEvent,
				},
				{
					route: "voucher-analytics",
					label: "Voucher Analytics",
					description: "View analytics and insights for vouchers.",
					icon: ChartBar,
					visible: visible.eventAdminOnly,
				},
				{
					route: "mall-live-feed",
					label: "Mall Live Feed",
					description:
						"Real-time mall analytics including shoppers, sales, vouchers, and top merchants.",
					icon: TrendingUp,
					visible: (p, e) =>
						e?.use_ticket === false && !(p.isEventVendor ?? false),
				},
			],
		},

		// ------------------------------------------------------------------------
		// LOGS GROUP - Activity history
		// ------------------------------------------------------------------------
		{
			id: "logs",
			label: "Logs",
			icon: Logs,
			tabs: [
				{
					route: "voucher-logs",
					label: "Voucher Logs",
					description: "View all voucher redemption logs for this event.",
					icon: Logs,
					visible: visible.eventAdmin,
				},
				{
					route: "stamp-logs",
					label: "Stamp Logs",
					description: "View all visitor stamp logs for this event.",
					icon: Logs,
					visible: (p, e) => visible.mallEvent(p, e) && visible.eventAdmin(p),
				},
				{
					route: "export-logs",
					label: "Export Logs",
					description: "Export event logs and data.",
					icon: Logs,
					visible: (p, e) => visible.ticketEvent(p, e) && visible.adminOnly(p),
				},
			],
		},

		// ------------------------------------------------------------------------
		// VOUCHERS GROUP - Voucher management and scanning
		// ------------------------------------------------------------------------
		{
			id: "vouchers",
			label: "Vouchers",
			icon: Ticket,
			tabs: [
				{
					route: "vouchers",
					label: "Vouchers",
					description: "View and manage vouchers for vendors.",
					icon: Ticket,
					visible: visible.vendorOrAdmin,
				},
				{
					route: "voucher-redemption",
					label: "Scan Voucher",
					description: "Scan and redeem vouchers.",
					icon: ScanQrCode,
					visible: visible.vendor,
				},
				{
					route: "visitor-stamps",
					label: "Visitor Stamp Scanner",
					description: "Scan visitor QR codes to create stamps.",
					icon: ScanQrCode,
					visible: visible.vendor,
				},
			],
		},
	],
} as const;

// ============================================================================
// ROUTE LOOKUP MAP - For layout.tsx to find menu item config by route
// ============================================================================

/**
 * Flattened map of all routes to their menu item configurations.
 * Used by layout.tsx to display current page title, description, and icon.
 */
export const routeMenuMap: Record<string, MenuItem> = (() => {
	const map: Record<string, MenuItem> = {};

	// Add standalone items
	for (const item of eventMenuConfig.standalone) {
		map[item.route] = item;
	}

	// Add grouped items
	for (const group of eventMenuConfig.groups) {
		for (const item of group.tabs) {
			map[item.route] = item;
		}
	}

	return map;
})();
