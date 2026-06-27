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
	Award,
	Briefcase,
	Building2,
	ChartBar,
	ClipboardList,
	CreditCard,
	FileText,
	Gift,
	Grid,
	Handshake,
	HardHat,
	Import,
	Key,
	Logs,
	type LucideIcon,
	MapPin,
	MessageSquareHeart,
	Package,
	PackageOpen,
	Printer,
	ScanQrCode,
	ShoppingCart,
	Speech,
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
import { FaGifts } from "react-icons/fa6";
import { HiTicket } from "react-icons/hi2";
import { TbClockDollar } from "react-icons/tb";
import type { useEventPermissions } from "@/hooks/use-event-permissions";
import type { Event } from "@/lib/api/event/response";

// ============================================================================
// TYPES
// ============================================================================

type Permissions = ReturnType<typeof useEventPermissions>;

export type EventMenuItem = {
	route: string;
	label: string;
	description: string;
	icon: IconType | LucideIcon;
	visible?: (permissions: Permissions, event?: Event) => boolean;
	isActive?: (pathname: string, route: string) => boolean;
};

export type EventMenuGroup = {
	id: string;
	label: string;
	icon: IconType | LucideIcon;
	visible?: (permissions: Permissions, event?: Event) => boolean;
	tabs: EventMenuItem[];
};

export type EventMenuConfig = {
	standalone: EventMenuItem[];
	groups: EventMenuGroup[];
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
	hasSeatTicketing: (_p: Permissions, e?: Event) =>
		e?.use_seat_ticketing === true,
	hasVouchers: (_p: Permissions, e?: Event) => e?.use_voucher === true,
	hasCertificate: (_p: Permissions, e?: Event) => e?.use_certificate === true,
	hasVendors: (_p: Permissions, e?: Event) => e?.use_exhibitor_kit !== true,

	// Special access
	luckyDrawAccess: (p: Permissions) =>
		p.isOrgOwner || p.isEventAdmin || p.isOrganizer || p.isEventStaff,
	prizeRouletteAccess: (p: Permissions) =>
		p.isOrgOwner || p.isEventAdmin || p.isEventVendor,
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
		e?.use_business_matching === true &&
		(p.isEventAdmin || p.isOrganizer || p.isEventStaff || p.isOrgOwner),
	// Organizer or org_owner only (for import visitors in mall events)
	organizerOrOwner: (p: Permissions) => p.isOrgOwner || p.isOrganizer,
	// photoBoothAccess: (p: Permissions, e?: Event) =>
	// 	e?.photo_booth_enabled === true &&
	// 	(p.isEventAdmin || p.isOrganizer || p.isEventStaff || p.isOrgOwner),
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
			route: "event-leads",
			label: "Event Leads",
			description: "Scan attendee QR codes to capture leads.",
			icon: Speech,
			visible: (p, e) => visible.vendor(p) && e?.use_event_leads === true,
		},
		{
			route: "contractor-profile",
			label: "Contractor Profile",
			description: "Manage your contractor profile and settings.",
			icon: User,
			visible: visible.contractorOnly,
		},
		{
			route: "sponsorships",
			label: "Sponsorships",
			description: "Manage event sponsorships and tiers.",
			icon: Handshake,
			visible: (p, e) => visible.eventAdmin(p) && e?.use_sponsorship === true,
		},
		{
			route: "business-matching",
			label: "Business Matching",
			description: "View and manage business matching for this event.",
			icon: Briefcase,
			visible: visible.businessMatchingAccess,
		},
		// {
		// 	route: "photo-booth",
		// 	label: "Photo Booth",
		// 	description: "Manage photo booth settings and gallery.",
		// 	icon: Camera,
		// 	visible: visible.photoBoothAccess,
		// },
		{
			route: "plans",
			label: "Seating Plans",
			description: "Manage seating plans and table assignments.",
			icon: Grid,
			visible: visible.eventAdmin,
		},
		{
			route: "wishes",
			label: "Guestbook",
			description:
				"Approve blessings for the live wishes wall, or keep unsuitable messages out of the venue display.",
			icon: MessageSquareHeart,
			visible: (_p: Permissions, e?: Event) => e?.use_wedding === true,
		},
		{
			route: "location",
			label: "Location",
			description: "View event location details and map.",
			icon: MapPin,
			visible: (p) =>
				!(p.isEventVendor ?? false) && !(p.isExhibitionContractor ?? false),
		},
		// Import Visitors - mall events only, organizer/org_owner only
		{
			route: "import-visitors",
			label: "Import Visitors",
			description: "Import visitors from Excel or CSV files.",
			icon: Import,
			visible: (p, e) => visible.mallEvent(p, e) && visible.organizerOrOwner(p),
		},
		{
			route: "api-keys",
			label: "API Keys",
			description: "Manage API keys for external integrations with this event.",
			icon: Key,
			visible: (p, e) =>
				e?.use_api_access === true && visible.organizerOrOwner(p),
		},
	],

	/** Grouped tabs with conditional visibility */
	groups: [
		// ------------------------------------------------------------------------
		// EVENT INFORMATION GROUP - Only for ticket-based events
		// ------------------------------------------------------------------------
		{
			id: "surprise-mechanics",
			label: "Surprise Mechanics",
			icon: BiInfoSquare,
			// Visible on both ticket and visitor events
			tabs: [
				{
					route: "lucky-draw",
					label: "Lucky Draw",
					description:
						"Manage lucky draw sessions, configurations, and prizes.",
					icon: Gift,
					visible: visible.luckyDrawAccess,
				},
				{
					route: "prize-roulette",
					label: "Prize Roulette",
					description: "Manage prize roulette sessions for this event.",
					icon: FaGifts,
					visible: visible.prizeRouletteAccess,
				},
			],
		},

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
				{
					route: "registration-forms",
					label: "Registration Forms",
					description: "Manage registration forms and ticket mapping.",
					icon: ClipboardList,
				},
				{
					route: "bundle-passes",
					label: "Bundle Passes",
					description: "Create private bundle pass links for invited entities.",
					icon: PackageOpen,
				},
				{
					route: "certificates",
					label: "E-Certificates",
					description: "Design and send certificates to attendees.",
					icon: Award,
					visible: (p, e) =>
						visible.hasCertificate(p, e) && visible.eventAdmin(p),
				},
			],
		},
		// ------------------------------------------------------------------------
		// SEAT TICKETING GROUP
		// ------------------------------------------------------------------------
		{
			id: "seat-ticketing",
			label: "Seat Reservation",
			icon: Ticket,
			visible: (p, e) => visible.hasSeatTicketing(p, e) && visible.adminOnly(p),
			tabs: [
				{
					route: "seat-ticketing/sessions",
					label: "Seat Reservation Sessions",
					description:
						"Set up and organize seat reservation sessions, sections, and seating layouts for this event.",
					icon: Ticket,
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
				// Main Contractor - org owner only, when using exhibitor kit
				{
					route: "exhibitor-contractor",
					label: "Main Contractor",
					description: "Assign and manage the main contractor for this event.",
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
			label: "Exhibitors",
			icon: ClipboardList,
			visible: visible.contractorOnly,
			tabs: [
				{
					route: "contractor-exhibitor-kits",
					label: "Exhibitor List",
					description: "View exhibitor list for this event.",
					icon: ClipboardList,
				},
				{
					route: "contractor-received-payments",
					label: "Received Payments",
					description: "View all payments received from exhibitors.",
					icon: CreditCard,
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
					visible: (_p, e) => e?.allow_contractor_printing_services === true,
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
					route: "contractor-guidelines",
					label: "Exhibitor Guidelines",
					description: "View exhibitor rules, terms & conditions.",
					icon: FileText,
				},
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
					route: "analytics/ticket",
					label: "Ticket Analytics",
					description:
						"View ticket registrations, scans, and revenue analytics.",
					icon: ChartBar,
					visible: (p, e) =>
						visible.ticketEvent(p, e) && visible.canAccessTickets(p),
				},
				{
					route: "analytics/visitor",
					label: "Visitor Analytics",
					description: "View visitor registrations and check-in analytics.",
					icon: ChartBar,
					visible: (p, e) => visible.mallEvent(p, e) && visible.eventAdmin(p),
				},
				{
					route: "mall-live-feed",
					label: "Mall Live Feed",
					description:
						"Real-time mall analytics including shoppers, sales, vouchers, and top merchants.",
					icon: TrendingUp,
					visible: (p, e) => e?.use_ticket === false && visible.eventAdmin(p),
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
					route: "lead-logs",
					label: "Lead Logs",
					description: "View all event lead logs for this event.",
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
export const routeMenuMap: Record<string, EventMenuItem> = (() => {
	const map: Record<string, EventMenuItem> = {};

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
