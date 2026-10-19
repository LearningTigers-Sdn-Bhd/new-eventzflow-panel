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
	Blocks,
	Briefcase,
	Building2,
	Car,
	ChartBar,
	ClipboardList,
	CreditCard,
	FileChartColumn,
	FileText,
	Gift,
	Grid,
	Handshake,
	HardHat,
	Import,
	Key,
	Logs,
	type LucideIcon,
	MailCheck,
	MapPin,
	MessageSquareHeart,
	MessageSquareQuote,
	MessageSquareText,
	Package,
	PackageOpen,
	Printer,
	Radio,
	ScanQrCode,
	Speech,
	SquareActivity,
	Ticket,
	TrendingUp,
	User,
	UserCheck,
	Users,
	Warehouse,
} from "lucide-react";
import type { IconType } from "react-icons";
import { BiInfoSquare } from "react-icons/bi";
import { FaGifts } from "react-icons/fa6";
import { HiTicket } from "react-icons/hi2";
import { TbClockDollar } from "react-icons/tb";
import type {
	EventSidebarEvent,
	EventPermissions as Permissions,
} from "@/lib/api/event/response";

// ============================================================================
// TYPES
// ============================================================================

export type EventMenuItem = {
	route: string;
	label: string;
	description: string;
	icon: IconType | LucideIcon;
	visible?: (permissions: Permissions, event?: EventSidebarEvent) => boolean;
	isActive?: (pathname: string, route: string) => boolean;
};

export type EventMenuGroup = {
	id: string;
	label: string;
	icon: IconType | LucideIcon;
	visible?: (permissions: Permissions, event?: EventSidebarEvent) => boolean;
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
	ticketEvent: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_ticket !== false,
	mallEvent: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_ticket === false,

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
	hasExhibitorKit: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_exhibitor_kit === true,
	hasSeatTicketing: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_seat_ticketing === true,
	hasVouchers: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_voucher === true,
	hasCertificate: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_certificate === true,
	hasFeedback: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_feedback === true,
	hasRfid: (_p: Permissions, e?: EventSidebarEvent) => e?.use_rfid === true,
	hasPeopleCounter: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_people_counter === true,
	hasVehicles: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.vehicles_enabled === true,
	hasVendors: (_p: Permissions, e?: EventSidebarEvent) =>
		e?.use_exhibitor_kit !== true,

	// Special access
	luckyDrawAccess: (p: Permissions) =>
		p.isOrgOwner ||
		p.isEventAdmin ||
		p.isOrganizer ||
		p.isEventStaff ||
		p.isEventVendor,
	prizeRouletteAccess: (p: Permissions) =>
		p.isOrgOwner || p.isEventAdmin || p.isEventVendor,
	exhibitorContractorAccess: (p: Permissions, e?: EventSidebarEvent) =>
		(visible.orgOwner(p) || p.isExhibitionContractor) &&
		visible.hasExhibitorKit(p, e),
	vendorExhibitorKitAccess: (p: Permissions, e?: EventSidebarEvent) =>
		visible.vendor(p) && visible.hasExhibitorKit(p, e),
	contractorOnly: (p: Permissions, e?: EventSidebarEvent) =>
		p.isExhibitionContractor && visible.hasExhibitorKit(p, e),
	// Org staff or contractor can access event items/printing services
	orgStaffOrContractor: (p: Permissions, e?: EventSidebarEvent) =>
		(visible.orgOwner(p) || p.isExhibitionContractor) &&
		visible.hasExhibitorKit(p, e),
	businessMatchingAccess: (p: Permissions, e?: EventSidebarEvent) =>
		e?.use_business_matching === true &&
		(p.isEventAdmin ||
			p.isOrganizer ||
			p.isEventStaff ||
			p.isOrgOwner ||
			p.isBusinessHost),
	// Organizer or org_owner only (for import visitors in mall events)
	organizerOrOwner: (p: Permissions) => p.isOrgOwner || p.isOrganizer,
	// photoBoothAccess: (p: Permissions, e?: Event) =>
	// 	e?.photo_booth_enabled === true &&
	// 	(p.isEventAdmin || p.isOrganizer || p.isEventStaff || p.isOrgOwner),
};

// ============================================================================
// MENU CONFIGURATION
// ============================================================================

const rawEventMenuConfig: EventMenuConfig = {
	/**
	 * Top block, always first: what this event is, plus the profile pages that
	 * only one role ever sees (vendor, contractor, host).
	 */
	standalone: [
		{
			route: "details",
			label: "Event Information",
			description: "View and manage event information.",
			icon: BiInfoSquare,
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
			route: "host-profile",
			label: "Host Profile",
			description: "Manage your business matching details and capabilities.",
			icon: User,
			visible: (p) => p.isBusinessHost,
		},
		{
			route: "event-leads",
			label: "Event Leads",
			description: "Scan attendee QR codes to capture leads.",
			icon: Speech,
			visible: (p, e) => visible.vendor(p) && e?.use_event_leads === true,
		},
		{
			route: "business-matching",
			label: "Business Matching",
			description: "View and manage business matching for this event.",
			icon: Briefcase,
			visible: visible.businessMatchingAccess,
		},
		{
			route: "sponsorships",
			label: "Sponsorships",
			description: "Manage event sponsorships and tiers.",
			icon: Handshake,
			visible: (p, e) => visible.eventAdmin(p) && e?.use_sponsorship === true,
		},
		// {
		// 	route: "photo-booth",
		// 	label: "Photo Booth",
		// 	description: "Manage photo booth settings and gallery.",
		// 	icon: Camera,
		// 	visible: visible.photoBoothAccess,
		// },
	],

	/**
	 * Groups, in the order a person works through an event:
	 * role workspaces, sell & register, seats, people, exhibitors, engage the
	 * crowd, feedback, run the day, review the numbers, settings.
	 */
	groups: [
		// ------------------------------------------------------------------------
		// MY EXHIBITOR KIT GROUP - Vendor's own booths (vendors only, so first for them)
		// ------------------------------------------------------------------------
		{
			id: "my-exhibitor-kit",
			label: "My Exhibitor Kits",
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
					route: "exhibitor-kits",
					label: "My Booths",
					description: "View and manage your exhibitor booths.",
					icon: Package,
				},
			],
		},

		// ------------------------------------------------------------------------
		// EXHIBITOR KITS GROUP - Contractor kit management (contractors only)
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
		// TICKETS GROUP - Selling and registering attendees (ticket-based events)
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
					route: "vehicles",
					label: "Vehicles",
					description:
						"View registered vehicles, their crew, and fix mismatches.",
					icon: Car,
					visible: (p, e) => visible.hasVehicles(p, e),
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
		// SEATING GROUP - Table plans and seat reservation
		// ------------------------------------------------------------------------
		{
			id: "seating",
			label: "Seating",
			icon: Grid,
			tabs: [
				{
					route: "plans",
					label: "Seating Plans",
					description: "Manage seating plans and table assignments.",
					icon: Grid,
					visible: visible.eventAdmin,
				},
				{
					route: "seat-ticketing/sessions",
					label: "Seat Reservation Sessions",
					description:
						"Set up and organize seat reservation sessions, sections, and seating layouts for this event.",
					icon: Ticket,
					visible: (p, e) =>
						visible.hasSeatTicketing(p, e) && visible.adminOnly(p),
				},
			],
		},

		// ------------------------------------------------------------------------
		// PEOPLE GROUP - Visitors, staff, vendors (hidden from contractors)
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
				// Import Visitors - mall events only, organizer/org_owner only
				{
					route: "import-visitors",
					label: "Import Visitors",
					description: "Import visitors from Excel or CSV files.",
					icon: Import,
					visible: (p, e) =>
						visible.mallEvent(p, e) && visible.organizerOrOwner(p),
				},
				// Event Staff - org owner only
				{
					route: "event-staff",
					label: "Event Staff",
					description: "Manage event staff assignments and permissions.",
					icon: Users,
					visible: visible.orgOwner,
				},
				// Vendors (events without exhibitor kits; those use Exhibitor Management)
				{
					route: "vendors",
					label: "Vendors",
					description: "View and manage vendors for this event.",
					icon: Building2,
					visible: (p, e) =>
						visible.eventAdminOnly(p) && visible.hasVendors(p, e),
				},
			],
		},

		// ------------------------------------------------------------------------
		// EXHIBITOR MANAGEMENT GROUP - Everything an organizer does for exhibitors
		// (not shown to contractors, who have their own group above)
		// ------------------------------------------------------------------------
		{
			id: "exhibitor-management",
			label: "Exhibitor Management",
			icon: Building2,
			visible: (p) => !(p.isExhibitionContractor ?? false),
			tabs: [
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
				// Catalog - org owner item/printing management
				{
					route: "rentable-items",
					label: "Event Items",
					description: "View rentable items linked to this event.",
					icon: Warehouse,
					visible: (p, e) =>
						visible.orgOwner(p) && visible.hasExhibitorKit(p, e),
				},
				{
					route: "printing-services",
					label: "Event Printing",
					description: "View printing services linked to this event.",
					icon: Printer,
					visible: (p, e) =>
						visible.orgOwner(p) && visible.hasExhibitorKit(p, e),
				},
				{
					route: "exhibitor-certificates",
					label: "Exhibitor E-Certificates",
					description: "Design and send certificates to exhibitor companies.",
					icon: Award,
					visible: (p, e) =>
						visible.hasCertificate(p, e) &&
						visible.hasExhibitorKit(p, e) &&
						visible.eventAdmin(p) &&
						!visible.vendor(p),
				},
			],
		},

		// ------------------------------------------------------------------------
		// ENGAGEMENT GROUP - Crowd-pleasers: draws, roulette, guestbook
		// ------------------------------------------------------------------------
		{
			id: "engagement",
			label: "Engagement",
			icon: Gift,
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
				{
					route: "wishes",
					label: "Guestbook",
					description:
						"Approve blessings for the live wishes wall, or keep unsuitable messages out of the venue display.",
					icon: MessageSquareHeart,
					visible: (_p: Permissions, e?: EventSidebarEvent) =>
						e?.use_wedding === true,
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
		// FEEDBACK GROUP - Form builder and attendee responses
		// ------------------------------------------------------------------------
		{
			id: "feedback",
			label: "Feedback",
			icon: MessageSquareText,
			visible: (p, e) => visible.eventAdminOnly(p) && visible.hasFeedback(p, e),
			tabs: [
				{
					route: "feedback/form-builder",
					label: "Form Builder",
					description: "Build the post-event feedback form.",
					icon: Blocks,
					isActive: (pathname) => pathname.endsWith("/feedback/form-builder"),
				},
				{
					route: "feedback/responses",
					label: "Responses",
					description: "Review attendee feedback.",
					icon: MessageSquareQuote,
				},
			],
		},

		// ------------------------------------------------------------------------
		// ON-SITE GROUP - Live operations during the event
		// ------------------------------------------------------------------------
		{
			id: "on-site",
			label: "On-site",
			icon: Radio,
			tabs: [
				{
					route: "rfid",
					label: "RFID",
					description:
						"RFID headcount, stations, bindings, visits, and corrections.",
					icon: Radio,
					visible: (p, e) =>
						visible.hasRfid(p, e) &&
						visible.ticketEvent(p, e) &&
						visible.eventAdmin(p),
				},
				{
					route: "people-counter",
					label: "People Counter",
					description:
						"Live people counts per hall and level. Org owners also set up the counter connection and halls.",
					icon: Users,
					visible: (p, e) =>
						visible.hasPeopleCounter(p, e) &&
						(visible.eventAdmin(p) || visible.organizerOrOwner(p)),
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
					route: "analytics/ticket",
					label: "Ticket Analytics",
					description:
						"View ticket registrations, scans, and revenue analytics.",
					icon: ChartBar,
					visible: (p, e) =>
						visible.ticketEvent(p, e) && visible.canAccessTickets(p),
				},
				{
					route: "custom-reports",
					label: "Custom Reports",
					description:
						"Build your own breakdowns by ticket type or custom registration field.",
					icon: FileChartColumn,
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
					route: "analytics/exhibitor",
					label: "Exhibitor Analytics",
					description:
						"View exhibitor booth bookings, payment status, and pricing sales.",
					icon: ChartBar,
					visible: (p, e) =>
						visible.hasExhibitorKit(p, e) && visible.eventAdmin(p),
				},
				{
					route: "voucher-analytics",
					label: "Voucher Analytics",
					description: "View analytics and insights for vouchers.",
					icon: ChartBar,
					visible: visible.vendorOrAdmin,
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
		// LOGS GROUP - Activity history and exports (what happened, newest concerns first)
		// ------------------------------------------------------------------------
		{
			id: "logs",
			label: "Logs",
			icon: Logs,
			tabs: [
				{
					route: "scanned-logs",
					label: "Scanned Logs",
					description: "View QR code scan logs and entry records.",
					icon: ScanQrCode,
					visible: (p) => visible.eventAdmin(p) || visible.canAccessTickets(p),
				},
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
					route: "email-status",
					label: "Email Status",
					description:
						"See which attendee emails were delivered, and fix bounces.",
					icon: MailCheck,
					visible: (p) => p.isOrgOwner || p.isEventAdmin,
				},
				{
					route: "event-activity",
					label: "Activity Log",
					description: "View recent actions on this event.",
					icon: SquareActivity,
					visible: (p) => p.isOrgOwner || p.isEventAdmin || p.isEventTeamMember,
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
		// SETTINGS GROUP - Integrations (last, rarely touched)
		// ------------------------------------------------------------------------
		{
			id: "settings",
			label: "Settings",
			icon: Key,
			tabs: [
				{
					route: "api-keys",
					label: "API Keys",
					description:
						"Manage API keys for external integrations with this event.",
					icon: Key,
					visible: (p, e) =>
						e?.use_api_access === true && visible.organizerOrOwner(p),
				},
			],
		},
	],
} as const;

// ============================================================================
// BUSINESS HOST LOCKDOWN
// ============================================================================
// A user invited purely as a business host (no other staff/admin/vendor
// standing on this event) should only ever see "Business Matching" and
// "Host Profile" — not whatever any individual tab's own `visible` check
// happens to allow. Patching every existing (and future) predicate
// individually is exactly how gaps like the Tickets group leaking through
// to business hosts happened, so this wraps the whole config once instead.
const BUSINESS_HOST_ALLOWED_ROUTES = new Set([
	"business-matching",
	"host-profile",
]);

const isPureBusinessHost = (p: Permissions) =>
	(p.isBusinessHost ?? false) &&
	!(p.isOrgOwner ?? false) &&
	!(p.isOrganizer ?? false) &&
	!(p.isEventAdmin ?? false) &&
	!(p.isEventTeamMember ?? false) &&
	!(p.isEventVendor ?? false) &&
	!(p.isExhibitionContractor ?? false);

function restrictForBusinessHosts(config: EventMenuConfig): EventMenuConfig {
	const guardItem = (item: EventMenuItem): EventMenuItem => ({
		...item,
		visible: (p: Permissions, e?: EventSidebarEvent) =>
			isPureBusinessHost(p)
				? BUSINESS_HOST_ALLOWED_ROUTES.has(item.route)
				: (item.visible?.(p, e) ?? true),
	});

	return {
		standalone: config.standalone.map(guardItem),
		groups: config.groups.map((group) => ({
			...group,
			// Business hosts never see a group unless it holds one of their
			// allowed routes (e.g. Activity Log lives in the Logs group) —
			// guardItem above still hides every other tab in that group.
			visible: (p: Permissions, e?: EventSidebarEvent) =>
				isPureBusinessHost(p)
					? group.tabs.some((t) => BUSINESS_HOST_ALLOWED_ROUTES.has(t.route))
					: (group.visible?.(p, e) ?? true),
			tabs: group.tabs.map(guardItem),
		})),
	};
}

// ============================================================================
// BUSINESS MATCHING ADMIN LOCKDOWN
// ============================================================================
// A user assigned as business_matching_admin (and nothing else) manages
// Business Matching for this event only — no other modules.
const BUSINESS_MATCHING_ADMIN_ALLOWED_ROUTES = new Set(["business-matching"]);

const isPureBusinessMatchingAdmin = (p: Permissions) =>
	(p.isBusinessMatchingAdmin ?? false) &&
	!(p.isOrgOwner ?? false) &&
	!(p.isOrganizer ?? false) &&
	!(p.isEventAdmin ?? false) &&
	!(p.isEventTeamMember ?? false) &&
	!(p.isEventVendor ?? false) &&
	!(p.isExhibitionContractor ?? false);

function restrictForBusinessMatchingAdmins(
	config: EventMenuConfig,
): EventMenuConfig {
	const guardItem = (item: EventMenuItem): EventMenuItem => ({
		...item,
		visible: (p: Permissions, e?: EventSidebarEvent) =>
			isPureBusinessMatchingAdmin(p)
				? BUSINESS_MATCHING_ADMIN_ALLOWED_ROUTES.has(item.route)
				: (item.visible?.(p, e) ?? true),
	});

	return {
		standalone: config.standalone.map(guardItem),
		groups: config.groups.map((group) => ({
			...group,
			visible: (p: Permissions, e?: EventSidebarEvent) =>
				isPureBusinessMatchingAdmin(p)
					? group.tabs.some((t) =>
							BUSINESS_MATCHING_ADMIN_ALLOWED_ROUTES.has(t.route),
						)
					: (group.visible?.(p, e) ?? true),
			tabs: group.tabs.map(guardItem),
		})),
	};
}

export const eventMenuConfig: EventMenuConfig =
	restrictForBusinessMatchingAdmins(
		restrictForBusinessHosts(rawEventMenuConfig),
	);

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
