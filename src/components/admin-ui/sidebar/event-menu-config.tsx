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
	Briefcase,
	Building2,
	ChartBar,
	Gift,
	HardHat,
	Logs,
	MapPin,
	Package,
	Printer,
	ScanQrCode,
	ShoppingCart,
	Ticket,
	TrendingUp,
	User,
	UserCheck,
	Users,
	UsersRound,
	Warehouse,
} from "lucide-react";
import type { IconType } from "react-icons";
import { BiInfoSquare } from "react-icons/bi";
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
		(!(p.isEventVendor ?? false) && !(p.isExhibitionContractor ?? false)) ||
		(p.canManageEventVendors ?? false),

	// Ticket access - exclude vendors, exhibitors, and contractors
	canAccessTickets: (p: Permissions) =>
		!(p.isEventVendor ?? false) && !(p.isExhibitionContractor ?? false),

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
	vendorExhibitorKitAccess: (p: Permissions, e?: Event) =>
		visible.vendor(p) && visible.hasExhibitorKit(p, e),
	contractorOnly: (p: Permissions, e?: Event) =>
		p.isExhibitionContractor && visible.hasExhibitorKit(p, e),
	// Org staff or contractor can access event items/printing services
	orgStaffOrContractor: (p: Permissions, e?: Event) =>
		(visible.orgOwner(p) || p.isExhibitionContractor) &&
		visible.hasExhibitorKit(p, e),
	businessMatchingAccess: (p: Permissions, e?: Event) =>
		p.isEventAdmin ||
		p.isOrganizer ||
		p.isEventStaff ||
		e?.use_business_matching === true,
};

// ============================================================================
// MENU CONFIGURATION
// ============================================================================

export const eventMenuConfig: EventMenuConfig = {
	/** Tabs that are always visible to all users */
	standalone: [
		{
			route: "details",
			label: "Event Information",
			description: "View and manage event information.",
			icon: BiInfoSquare,
		},
		{
			route: "vendor-profile",
			label: "Vendor Profile",
			description: "Manage your vendor profile and settings.",
			icon: User,
			visible: visible.vendor,
		},
		{
			route: "contractor-profile",
			label: "Contractor Profile",
			description: "Manage your contractor profile and settings.",
			icon: User,
			visible: visible.contractorOnly,
		},
		{
			route: "business-matching",
			label: "Business Matching",
			description: "View and manage business matching for this event.",
			icon: Briefcase,
			visible: visible.businessMatchingAccess,
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
			visible: (p, e) =>
				visible.ticketEvent(p, e) && visible.canAccessTickets(p),
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
		// PEOPLE GROUP - Staff, visitors, vendors (hidden from contractors)
		// ------------------------------------------------------------------------
		{
			id: "people",
			label: "People",
			icon: Users,
			visible: (p) => !(p.isExhibitionContractor ?? false),
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
						visible.eventAdminOnly(p) && visible.hasVendors(p, e),
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
		// EXHIBITOR KITS GROUP - Contractor kit management (contractor only)
		// ------------------------------------------------------------------------
		{
			id: "exhibitor-kits",
			label: "Exhibitor Kits",
			icon: Package,
			visible: visible.contractorOnly,
			tabs: [
				{
					route: "contractor-exhibitor-kits",
					label: "Exhibitor Kits",
					description: "View and manage exhibitor kits for this event.",
					icon: Package,
				},
				{
					route: "rentable-items",
					label: "Event Item",
					description: "View and manage rentable items for this event.",
					icon: Warehouse,
				},
				{
					route: "printing-services",
					label: "Event Printing",
					description: "View and manage printing services for this event.",
					icon: Printer,
					visible: (p, e) => e?.allow_contractor_printing_services === true,
				},
			],
		},

		// ------------------------------------------------------------------------
		// EVENT CATALOG GROUP - Org owner item/printing management
		// ------------------------------------------------------------------------
		{
			id: "event-catalog",
			label: "Event Catalog",
			icon: Package,
			visible: (p, e) =>
				visible.orgOwner(p) &&
				visible.hasExhibitorKit(p, e) &&
				!p.isExhibitionContractor,
			tabs: [
				{
					route: "rentable-items",
					label: "Event Items",
					description: "View rentable items linked to this event.",
					icon: Warehouse,
				},
				{
					route: "printing-services",
					label: "Event Printing",
					description: "View printing services linked to this event.",
					icon: Printer,
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
				{
					route: "vouchers",
					label: "Vouchers",
					description: "View and manage vouchers for vendors.",
					icon: Ticket,
					visible: visible.vendorOrAdmin,
				},
			],
		},

		// ------------------------------------------------------------------------
		// MY EXHIBITOR KIT GROUP - Vendor exhibitor kit management
		// ------------------------------------------------------------------------
		{
			id: "my-exhibitor-kit",
			label: "My Exhibitor Kit",
			icon: Package,
			visible: visible.vendorExhibitorKitAccess,
			tabs: [
				{
					route: "order-items",
					label: "Order Kits",
					description: "Browse and order exhibitor kit items.",
					icon: ShoppingCart,
				},
				{
					route: "my-items",
					label: "My Kits",
					description: "View and manage your ordered kit items.",
					icon: Package,
				},
				{
					route: "team-members",
					label: "My Team",
					description: "Manage your team members for this event.",
					icon: UsersRound,
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
					route: "voucher-analytics",
					label: "Voucher Analytics",
					description: "View analytics and insights for vouchers.",
					icon: ChartBar,
					visible: visible.vendorOrAdmin,
				},
				{
					route: "analytics",
					label: "Ticket Analytics",
					description: "View event analytics, charts, and insights.",
					icon: ChartBar,
					visible: (p, e) =>
						visible.ticketEvent(p, e) && visible.canAccessTickets(p),
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
		// LOGS GROUP - Activity history (Admin only)
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
