"use client";

import { useQuery } from "@tanstack/react-query";
import { ChartBar, Logs, MapPin, ScanQrCode, Users, Building2, UserCheck, Ticket, TrendingUp, ChevronDown } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";
import { use, useCallback, useMemo } from "react";
import type { IconType } from "react-icons";
import { HiTicket } from "react-icons/hi2";
import { RiCalendarEventFill } from "react-icons/ri";
import { TbClockDollar } from "react-icons/tb";
import { TabHeader } from "@/components/pages/event/tab-header";
import { Badge } from "@/components/ui/badge";
import { IconTitle } from "@/components/ui/icon-heading";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useIsTablet } from "@/hooks/use-tablet";
import { getEvents } from "@/lib/api/event";
import { useEventActionsStore } from "@/stores/event-actions-store";
import { cn } from "@/lib/utils";

interface EventDetailLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		event_id: string;
	}>;
}

type TabItem = {
	id: string;
	label: string;
	title: string;
	description: string;
	icon: IconType;
	route: string;
};

const tabItems: TabItem[] = [
	{
		id: "location",
		label: "View Location",
		title: "View Location",
		description: "This page will display the event location details and map.",
		icon: MapPin,
		route: "location",
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
		id: "visitors",
		label: "Visitors",
		title: "Event Visitors",
		description:
			"Manage visitors for non-ticket events.",
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
		label: "Vendor Profile",
		title: "Vendor Profile",
		description:
			"View and manage vendor profile information.",
		icon: Building2,
		route: "vendors",
	},
	{
		id: "vouchers",
		label: "Vouchers",
		title: "Vouchers",
		description:
			"View and manage vouchers created by this vendor.",
		icon: Ticket,
		route: "vouchers",
	},
	{
		id: "voucher-redemption",
		label: "Scan Voucher",
		title: "Scan Voucher / Redeem Voucher",
		description:
			"Scan and redeem vouchers.",
		icon: ScanQrCode,
		route: "voucher-redemption",
	},
	{
		id: "visitor-stamps",
		label: "Stamp Scanner",
		title: "Visitor Stamp Scanner",
		description:
			"Scan visitor QR codes to create stamps.",
		icon: ScanQrCode,
		route: "visitor-stamps",
	},
	{
		id: "voucher-analytics",
		label: "Voucher Analytics",
		title: "Voucher Analytics",
		description:
			"View analytics and insights for vouchers.",
		icon: ChartBar,
		route: "voucher-analytics",
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

function EventActionsSlot() {
	const actions = useEventActionsStore((state) => state.actions);
	return actions ? (
		<div className="flex items-center gap-3">{actions}</div>
	) : null;
}

export default function EventDetailLayout({
	children,
	params,
}: EventDetailLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { event_id } = use(params);
	const isTablet = useIsTablet();

	// Fetch event details
	const { data: events, isLoading } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});
	const currentEvent = events?.find(
		(event) => event.id.toString() === event_id,
	);

	// Get event permissions for the current user
	const permissions = useEventPermissions(event_id, currentEvent);

	// Filter tabs based on permissions and event type
	const visibleTabs = useMemo(() => {
		const filtered = tabItems.filter((tab) => {
			// For vendors, only show these 6 specific tabs (including location)
			if (permissions.isEventVendor && !permissions.canManageEventVendors) {
				return ["location", "vendors", "vouchers", "voucher-redemption", "voucher-analytics", "visitor-stamps"].includes(tab.id);
			}

			// Always show these tabs (for non-vendors)
			if (["location"].includes(tab.id)) {
				return true;
			}

			// Export logs - hide for vendors and non-ticket events
			if (tab.id === "export-logs") {
				return currentEvent?.use_ticket !== false && !permissions.isEventVendor;
			}

			// Ticket-related tabs - only for ticket events
			if (["tickets", "pending-tickets", "scanned-logs", "analytics"].includes(tab.id)) {
				return currentEvent?.use_ticket !== false;
			}

			// Mall live feed - only for non-ticket events (mall events)
			if (tab.id === "mall-live-feed") {
				return currentEvent?.use_ticket === false;
			}

			// Event staff - only org_owner can manage
			if (tab.id === "event-staff") {
				return permissions.canManageEventStaff;
			}

			// Vendors tab - visible to event admins and vendors
			if (tab.id === "vendors") {
				return permissions.canViewVendorsTab;
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

			// Visitors tab - only for non-ticket events, visible to event staff
			if (tab.id === "visitors") {
				return permissions.canViewVisitorsTab;
			}

			// Stamp scanner - visible to vendors and event staff for non-ticket events
			if (tab.id === "visitor-stamps") {
				// Vendors can always see it
				if (permissions.isEventVendor) {
					return true;
				}
				// Event staff can see it only for non-ticket events
				return permissions.canViewStampScannerTab;
			}

			return true;
		});
		
		// For vendors, reorder tabs to put location after vendors
		if (permissions.isEventVendor && !permissions.canManageEventVendors) {
			const vendorTabOrder = ["vendors", "location", "vouchers", "voucher-redemption", "voucher-analytics", "visitor-stamps"];
			return filtered.sort((a, b) => {
				const indexA = vendorTabOrder.indexOf(a.id);
				const indexB = vendorTabOrder.indexOf(b.id);
				return indexA - indexB;
			});
		}
		
		return filtered;
	}, [currentEvent?.use_ticket, permissions]);

	// Group ticket-related tabs for dropdown
	const ticketTabIds = ["tickets", "pending-tickets", "scanned-logs"];
	const ticketTabs = useMemo(() => {
		return visibleTabs.filter((tab) => ticketTabIds.includes(tab.id));
	}, [visibleTabs]);

	// Group analytics-related tabs for dropdown
	const analyticsTabIds = ["analytics", "voucher-analytics", "mall-live-feed"];
	const analyticsTabs = useMemo(() => {
		return visibleTabs.filter((tab) => analyticsTabIds.includes(tab.id));
	}, [visibleTabs]);

	// Main tabs (excluding ticket and analytics sub-tabs, but we'll add group tabs)
	const mainTabs = useMemo(() => {
		const filtered = visibleTabs.filter((tab) => !ticketTabIds.includes(tab.id) && !analyticsTabIds.includes(tab.id));
		
		// If there are ticket tabs, add a grouped "Tickets" tab
		if (ticketTabs.length > 0) {
			// Insert the tickets group after location
			const locationIndex = filtered.findIndex((tab) => tab.id === "location");
			const ticketsGroupTab: TabItem = {
				id: "tickets-group",
				label: "Tickets",
				title: "Ticket Management",
				description: "Manage tickets, pending transactions, and scan logs",
				icon: HiTicket,
				route: "tickets", // Default to tickets page
			};
			filtered.splice(locationIndex + 1, 0, ticketsGroupTab);
		}
		
		// If there are analytics tabs, add a grouped "Analytics" tab
		if (analyticsTabs.length > 0) {
			// Insert analytics group before export-logs or at the end
			const exportLogsIndex = filtered.findIndex((tab) => tab.id === "export-logs");
			const insertIndex = exportLogsIndex !== -1 ? exportLogsIndex : filtered.length;
			const analyticsGroupTab: TabItem = {
				id: "analytics-group",
				label: "Analytics",
				title: "Analytics & Insights",
				description: "View ticket analytics, voucher insights, and mall live feed",
				icon: ChartBar,
				route: "analytics", // Default to analytics page
			};
			filtered.splice(insertIndex, 0, analyticsGroupTab);
		}
		
		return filtered;
	}, [visibleTabs, ticketTabs, analyticsTabs]);

	// Update vendor tab label, title, and description based on user role
	const tabsWithDynamicLabels = useMemo(() => {
		return mainTabs.map((tab) => {
			if (tab.id === "vendors") {
				// If user is a vendor (not admin), show "Vendor Profile"
				if (permissions.isEventVendor && !permissions.canManageEventVendors) {
					return {
						...tab,
						label: "Vendor Profile",
						title: "Vendor Profile",
						description: "View and manage your vendor profile information.",
					};
				}
				// Otherwise show "Vendors" for admins/organizers
				return {
					...tab,
					label: "Vendors",
					title: "Event Vendors",
					description: "View and manage vendors for this event.",
				};
			}
			return tab;
		});
	}, [mainTabs, permissions.isEventVendor, permissions.canManageEventVendors]);

	// Extract the current tab from pathname.
	// For nested routes like /event/[id]/vendors/[vendor_id]/profile,
	// we still want the "vendors" tab to be active.
	const currentTab = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);

		// Walk from the end and find the first segment that matches a tab route
		for (let i = segments.length - 1; i >= 0; i--) {
			const segment = segments[i];
			// Check if it's a ticket-related tab
			if (ticketTabIds.includes(segment)) {
				return "tickets-group";
			}
			// Check if it's an analytics-related tab
			if (analyticsTabIds.includes(segment)) {
				return "analytics-group";
			}
			if (visibleTabs.some((tab) => tab.route === segment)) {
				return segment;
			}
		}

		// Default to the first visible tab (usually "location")
		return visibleTabs[0]?.route ?? "location";
	}, [pathname, visibleTabs, ticketTabIds, analyticsTabIds]);

	// Find the current tab item for dynamic header
	const currentTabItem = useMemo(() => {
		// If we're on a ticket-related or analytics-related page, find the specific tab
		const segments = pathname.split("/").filter(Boolean);
		for (let i = segments.length - 1; i >= 0; i--) {
			const segment = segments[i];
			if (ticketTabIds.includes(segment) || analyticsTabIds.includes(segment)) {
				return visibleTabs.find((item) => item.route === segment) || tabsWithDynamicLabels[0];
			}
		}
		
		return tabsWithDynamicLabels.find((item) => item.route === currentTab) || tabsWithDynamicLabels[0];
	}, [currentTab, tabsWithDynamicLabels, pathname, visibleTabs, ticketTabIds, analyticsTabIds]);

	const handleTabChange = useCallback(
		(value: string) => {
			const path = `/event/${event_id}/${value}`;
			(router as AppRouterInstance).push(path);
		},
		[event_id, router],
	);

	// If no tabs are visible, show a message
	if (tabsWithDynamicLabels.length === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-muted-foreground">
					You don't have permission to view this event.
				</p>
			</div>
		);
	}

	return (
		<div className="p-0">
			<div className="">
				<div className="border-b border-dashed">
					{isLoading ? (
						<>
							<Skeleton className="mb-2 h-9 w-64" />
							<Skeleton className="h-5 w-96" />
						</>
					) : (
						<div className="page-header">
							<div className="px-2 md:px-4">
								<IconTitle
									icon={RiCalendarEventFill}
									title={currentEvent?.title || `Event ${event_id}`}
									description={currentEvent?.description || "Manage and view details for this event"}
								/>
							</div>
							{currentEvent?.status && (
								<div className="px-2 md:px-4">
									<Badge
										variant={
											currentEvent.status === "published"
												? "default"
												: "secondary"
										}
										className="rounded-none"
									>
										{currentEvent.status === "published"
											? "Published"
											: "Draft"}
									</Badge>
								</div>
							)}
						</div>
					)}
				</div>
				<div className="w-full border-y border-dashed">
					{isTablet ? (
						<Select 
							value={
								currentTab === "tickets-group" ? "tickets" : 
								currentTab === "analytics-group" ? "analytics" : 
								currentTab
							} 
							onValueChange={handleTabChange}
						>
							<SelectTrigger className="h-12! w-full rounded-none border-none bg-accent/50 transition-colors hover:bg-accent">
								<SelectValue>
									{(() => {
										const IconComponent = currentTabItem.icon;
										return (
											<div className="flex items-center gap-2">
												<IconComponent className="size-4" />
												<span>{currentTabItem.label}</span>
											</div>
										);
									})()}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="rounded-none bg-background">
								{tabsWithDynamicLabels.map((item) => {
									const IconComponent = item.icon;
									
									// If this is the tickets group, show all ticket options
									if (item.id === "tickets-group") {
										return ticketTabs.map((ticketTab) => {
											const TicketIcon = ticketTab.icon;
											return (
												<SelectItem
													key={ticketTab.id}
													value={ticketTab.route}
													className="h-10! rounded-none"
												>
													<div className="flex items-center gap-2">
														<TicketIcon className="size-4" />
														<span>{ticketTab.label}</span>
													</div>
												</SelectItem>
											);
										});
									}
									
									// If this is the analytics group, show all analytics options
									if (item.id === "analytics-group") {
										return analyticsTabs.map((analyticsTab) => {
											const AnalyticsIcon = analyticsTab.icon;
											return (
												<SelectItem
													key={analyticsTab.id}
													value={analyticsTab.route}
													className="h-10! rounded-none"
												>
													<div className="flex items-center gap-2">
														<AnalyticsIcon className="size-4" />
														<span>{analyticsTab.label}</span>
													</div>
												</SelectItem>
											);
										});
									}
									
									return (
										<SelectItem
											key={item.id}
											value={item.route}
											className="h-10! rounded-none"
										>
											<div className="flex items-center gap-2">
												<IconComponent className="size-4" />
												<span>{item.label}</span>
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					) : (
						<Tabs value={currentTab} onValueChange={handleTabChange}>
							<TabsList className="flex h-12 w-full rounded-none">
								{tabsWithDynamicLabels.map((item) => {
									const IconComponent = item.icon;
									
									// Render tickets dropdown
									if (item.id === "tickets-group") {
										const isTicketTabActive = ticketTabIds.includes(currentTab) || currentTab === "tickets-group";
										
										return (
											<DropdownMenu key={item.id}>
												<DropdownMenuTrigger asChild>
													<button
														className={cn(
															"inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1 whitespace-nowrap border border-transparent px-2 py-1 font-medium text-foreground text-sm transition-[color,box-shadow] lg:gap-1.5",
															"hover:bg-accent hover:text-accent-foreground",
															"focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
															"dark:text-muted-foreground",
															isTicketTabActive && "bg-background shadow-sm dark:border-input dark:bg-input/30 dark:text-foreground"
														)}
													>
														<IconComponent className="size-5 lg:size-4" />
														<span className="hidden xl:inline">{item.label}</span>
														<ChevronDown className="ml-0.5 size-3 opacity-50" />
													</button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="start" className="min-w-[200px]">
													{ticketTabs.map((ticketTab) => {
														const TicketIcon = ticketTab.icon;
														return (
															<DropdownMenuItem
																key={ticketTab.id}
																onClick={() => handleTabChange(ticketTab.route)}
																className="cursor-pointer"
															>
																<TicketIcon className="mr-2 size-4" />
																<span>{ticketTab.label}</span>
															</DropdownMenuItem>
														);
													})}
												</DropdownMenuContent>
											</DropdownMenu>
										);
									}
									
									// Render analytics dropdown
									if (item.id === "analytics-group") {
										const isAnalyticsTabActive = analyticsTabIds.includes(currentTab) || currentTab === "analytics-group";
										
										return (
											<DropdownMenu key={item.id}>
												<DropdownMenuTrigger asChild>
													<button
														className={cn(
															"inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1 whitespace-nowrap border border-transparent px-2 py-1 font-medium text-foreground text-sm transition-[color,box-shadow] lg:gap-1.5",
															"hover:bg-accent hover:text-accent-foreground",
															"focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
															"dark:text-muted-foreground",
															isAnalyticsTabActive && "bg-background shadow-sm dark:border-input dark:bg-input/30 dark:text-foreground"
														)}
													>
														<IconComponent className="size-5 lg:size-4" />
														<span className="hidden xl:inline">{item.label}</span>
														<ChevronDown className="ml-0.5 size-3 opacity-50" />
													</button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="start" className="min-w-[200px]">
													{analyticsTabs.map((analyticsTab) => {
														const AnalyticsIcon = analyticsTab.icon;
														return (
															<DropdownMenuItem
																key={analyticsTab.id}
																onClick={() => handleTabChange(analyticsTab.route)}
																className="cursor-pointer"
															>
																<AnalyticsIcon className="mr-2 size-4" />
																<span>{analyticsTab.label}</span>
															</DropdownMenuItem>
														);
													})}
												</DropdownMenuContent>
											</DropdownMenu>
										);
									}
									
									// Regular tab
									return (
										<TabsTrigger
											key={item.id}
											value={item.route}
											className="flex flex-1 items-center justify-center gap-1 rounded-none lg:gap-2"
										>
											<IconComponent className="size-5 lg:size-4" />
											<span className="hidden xl:inline">{item.label}</span>
										</TabsTrigger>
									);
								})}
							</TabsList>
						</Tabs>
					)}
				</div>
			</div>
			<div className="w-full rounded-none border border-dashed bg-card">
				<TabHeader
					icon={currentTabItem.icon}
					title={currentTabItem.title}
					description={currentTabItem.description}
					actions={<EventActionsSlot />}
				/>
				{children}
			</div>
		</div>
	);
}
