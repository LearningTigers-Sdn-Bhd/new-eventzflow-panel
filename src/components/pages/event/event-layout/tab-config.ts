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
		route: "my-profile",
	},
	{
		id: "my-items",
		label: "My Items",
		title: "My Ordered Items",
		description: "View your ordered items and printing services.",
		icon: ShoppingBag,
		route: "my-exhibitor-kit/my-items",
	},
	{
		id: "order-items",
		label: "Order Items",
		title: "Order Items & Services",
		description:
			"Browse and order rentable items and printing services for your booth.",
		icon: Package,
		route: "my-exhibitor-kit/order-items",
	},
	{
		id: "custom-requests",
		label: "Custom Requests",
		title: "Custom Requests",
		description: "Submit custom requests for items not in the catalog.",
		icon: Package,
		route: "my-exhibitor-kit/custom-requests",
	},
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
		label: "Exhibitor Contractor",
		title: "Exhibitor Contractor",
		description: "Assign and manage exhibitor contractors for this event.",
		icon: HardHat,
		route: "exhibitor-contractor",
	},
	{
		id: "contractor-profile",
		label: "My Profile",
		title: "My Profile",
		description: "View and manage your contractor profile information.",
		icon: HardHat,
		route: "exhibitor-contractor",
	},
	{
		id: "contractor-exhibitor-kits",
		label: "Exhibitor Kits",
		title: "Exhibitor Kits",
		description: "View and manage exhibitor kits for this event.",
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
	{
		id: "contractor-custom-requests",
		label: "Custom Requests",
		title: "Custom Requests",
		description: "Review and manage custom requests from exhibitors.",
		icon: Package,
		route: "contractor-custom-requests",
	},
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
		id: "visitor-stamps",
		label: "Stamp Scanner",
		title: "Visitor Stamp Scanner",
		description: "Scan visitor QR codes to create stamps.",
		icon: ScanQrCode,
		route: "visitor-stamps",
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
		id: "stamp-logs",
		label: "Stamp Logs",
		title: "Stamp Logs",
		description: "View all visitor stamp logs for this event.",
		icon: Logs,
		route: "stamp-logs",
	},
	{
		id: "analytics",
		label: "Ticket Analytics",
		title: "Ticket Analytics",
		description:
			"This page will display event analytics, charts, and insights.",
		icon: ChartBar,
		route: "analytics",
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
	"analytics",
	"voucher-analytics",
	"mall-live-feed",
];
export const LOGS_TAB_IDS = ["voucher-logs", "stamp-logs", "export-logs"];
export const EXHIBITOR_KIT_TAB_IDS = [
	"my-items",
	"order-items",
	"custom-requests",
];
export const USER_MANAGEMENT_TAB_IDS = [
	"event-staff",
	"vendors",
	"exhibitor",
	"exhibitor-contractor",
];
