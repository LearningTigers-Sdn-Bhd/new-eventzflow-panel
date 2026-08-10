import {
	Building2,
	ChartBar,
	Gift,
	HardHat,
	Logs,
	MapPin,
	Package,
	ScanQrCode,
	ShoppingBag,
	Ticket,
	TrendingUp,
	UserCheck,
	Users,
} from "lucide-react";
import type { IconType } from "react-icons";
import { HiTicket } from "react-icons/hi2";
import { TbClockDollar } from "react-icons/tb";

export type TabItem = {
	id: string;
	label: string;
	title: string;
	description: string;
	icon: IconType;
	route: string;
};

export const TAB_ITEMS: TabItem[] = [
	{
		id: "location",
		label: "View Location",
		title: "View Location",
		description: "This page will display the event location details and map.",
		icon: MapPin,
		route: "location",
	},
	{
		id: "lucky-draw",
		label: "Lucky Draw",
		title: "Lucky Draw Sessions",
		description: "Manage lucky draw sessions, configurations, and prizes.",
		icon: Gift,
		route: "lucky-draw",
	},
	{
		id: "tickets",
		label: "Manage Tickets",
		title: "Manage Tickets",
		description:
			"This page will display ticket management interface and controls.",
		icon: HiTicket,
		route: "tickets",
	},
	{
		id: "pending-tickets",
		label: "Pending Tickets",
		title: "Pending Tickets",
		description:
			"This page will display pending ticket transactions and approvals.",
		icon: TbClockDollar,
		route: "pending-tickets",
	},
	{
		id: "scanned-logs",
		label: "Scanned Logs",
		title: "Scanned Logs",
		description: "This page will display QR code scan logs and entry records.",
		icon: ScanQrCode,
		route: "scanned-logs",
	},
	{
		id: "ticket-types",
		label: "Ticket Types",
		title: "Ticket Types",
		description: "Manage ticket types for this event.",
		icon: HiTicket,
		route: "ticket-types",
	},
	{
		id: "visitors",
		label: "Visitors",
		title: "Event Visitors",
		description: "Manage visitors for non-ticket events.",
		icon: UserCheck,
		route: "visitors",
	},
	{
		id: "event-staff",
		label: "Event Staff",
		title: "Event Staff",
		description:
			"This page will display event staff assignments and management.",
		icon: Users,
		route: "event-staff",
	},
	{
		id: "vendors",
		label: "Vendors",
		title: "Vendors",
		description: "View and manage vendors for this event.",
		icon: Building2,
		route: "vendors",
	},
	{
		id: "vendor-profile",
		label: "My Profile",
		title: "My Profile",
		description: "View your vendor profile and exhibitor kit details.",
		icon: Building2,
		route: "vendor-profile",
	},
	{
		id: "my-team-members",
		label: "My Team",
		title: "My Team Members",
		description: "Manage your team members for this event.",
		icon: Users,
		route: "team-members",
	},
	{
		id: "my-items",
		label: "My Items",
		title: "My Ordered Items",
		description: "View your ordered items and printing services.",
		icon: ShoppingBag,
		route: "my-items",
	},
	{
		id: "order-items",
		label: "Order Items",
		title: "Order Items & Services",
		description:
			"Browse and order rentable items and printing services for your booth.",
		icon: Package,
		route: "order-items",
	},
	// HIDDEN: Custom Requests feature temporarily disabled
	// {
	// 	id: "custom-requests",
	// 	label: "Custom Requests",
	// 	title: "Custom Requests",
	// 	description: "Submit custom requests for items not in the catalog.",
	// 	icon: Package,
	// 	route: "custom-requests",
	// },
	{
		id: "exhibitor",
		label: "Exhibitor",
		title: "Exhibitor",
		description: "View and manage exhibitors and their kits for this event.",
		icon: Building2,
		route: "exhibitor",
	},
	{
		id: "exhibitor-contractor",
		label: "Main Contractor",
		title: "Main Contractor",
		description: "Assign and manage the main contractor for this event.",
		icon: HardHat,
		route: "exhibitor-contractor",
	},
	{
		id: "contractor-profile",
		label: "My Profile",
		title: "My Profile",
		description: "View and manage your contractor profile information.",
		icon: HardHat,
		route: "contractor-profile",
	},
	{
		id: "contractor-exhibitor-kits",
		label: "Exhibitor List",
		title: "Exhibitor List",
		description: "View exhibitor list for this event.",
		icon: Package,
		route: "contractor-exhibitor-kits",
	},
	{
		id: "rentable-items",
		label: "Rentable Items",
		title: "Event Rentable Items",
		description:
			"Link your rentable items to this event and configure pricing tiers.",
		icon: Building2,
		route: "rentable-items",
	},
	{
		id: "printing-services",
		label: "Printing Services",
		title: "Event Printing Services",
		description:
			"Link your printing services to this event and manage pricing.",
		icon: Building2,
		route: "printing-services",
	},
	// HIDDEN: Custom Requests feature temporarily disabled
	// {
	// 	id: "contractor-custom-requests",
	// 	label: "Custom Requests",
	// 	title: "Custom Requests",
	// 	description: "Review and manage custom requests from exhibitors.",
	// 	icon: Package,
	// 	route: "contractor-custom-requests",
	// },
	{
		id: "vouchers",
		label: "Vouchers",
		title: "Vouchers",
		description: "View and manage vouchers created by this vendor.",
		icon: Ticket,
		route: "vouchers",
	},
	{
		id: "voucher-redemption",
		label: "Scan Voucher",
		title: "Scan Voucher / Redeem Voucher",
		description: "Scan and redeem vouchers.",
		icon: ScanQrCode,
		route: "voucher-redemption",
	},
	{
		id: "event-leads",
		label: "Event Leads",
		title: "Event Leads",
		description: "Scan attendee QR codes to capture leads.",
		icon: ScanQrCode,
		route: "event-leads",
	},
	{
		id: "voucher-analytics",
		label: "Voucher Analytics",
		title: "Voucher Analytics",
		description: "View analytics and insights for vouchers.",
		icon: ChartBar,
		route: "voucher-analytics",
	},
	{
		id: "voucher-logs",
		label: "Voucher Logs",
		title: "Voucher Logs",
		description: "View all voucher redemption logs for this event.",
		icon: Logs,
		route: "voucher-logs",
	},
	{
		id: "lead-logs",
		label: "Lead Logs",
		title: "Lead Logs",
		description: "View all event lead logs for this event.",
		icon: Logs,
		route: "lead-logs",
	},
	{
		id: "ticket-analytics",
		label: "Ticket Analytics",
		title: "Ticket Analytics",
		description: "View ticket registrations, scans, and revenue analytics.",
		icon: ChartBar,
		route: "analytics/ticket",
	},
	{
		id: "visitor-analytics",
		label: "Visitor Analytics",
		title: "Visitor Analytics",
		description: "View visitor registrations and check-in analytics.",
		icon: ChartBar,
		route: "analytics/visitor",
	},
	{
		id: "exhibitor-analytics",
		label: "Exhibitor Analytics",
		title: "Exhibitor Analytics",
		description: "View exhibitor booth bookings, payments, and pricing sales.",
		icon: ChartBar,
		route: "analytics/exhibitor",
	},
	{
		id: "vendor-analytics",
		label: "Vendor Analytics",
		title: "Vendor Analytics",
		description: "View vendor participation and activity analytics.",
		icon: ChartBar,
		route: "analytics/vendor",
	},
	{
		id: "mall-live-feed",
		label: "Mall Live Feed",
		title: "Mall Live Feed",
		description:
			"Real-time mall analytics including shoppers, sales, vouchers, and top merchants.",
		icon: TrendingUp,
		route: "mall-live-feed",
	},
	{
		id: "export-logs",
		label: "Export Logs",
		title: "Export Logs",
		description:
			"This page will provide options to export event logs and data.",
		icon: Logs,
		route: "export-logs",
	},
];

export const TICKET_TAB_IDS = [
	"tickets",
	"pending-tickets",
	"scanned-logs",
	"ticket-types",
];
export const ANALYTICS_TAB_IDS = [
	"ticket-analytics",
	"visitor-analytics",
	"exhibitor-analytics",
	"vendor-analytics",
	"voucher-analytics",
	"mall-live-feed",
];
export const LOGS_TAB_IDS = ["voucher-logs", "lead-logs", "export-logs"];
export const EXHIBITOR_KIT_TAB_IDS = [
	"my-team-members",
	"my-items",
	"order-items",
	// "custom-requests", // HIDDEN: Custom Requests feature temporarily disabled
];
export const USER_MANAGEMENT_TAB_IDS = [
	"event-staff",
	"vendors",
	"exhibitor",
	"exhibitor-contractor",
];
