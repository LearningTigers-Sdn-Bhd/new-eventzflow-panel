"use client";

import { useQuery } from "@tanstack/react-query";
import { ChartBar, Logs, MapPin, ScanQrCode, Users, Building2, UserCheck } from "lucide-react";
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
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useIsTablet } from "@/hooks/use-tablet";
import { getEvents } from "@/lib/api/event";
import { useEventActionsStore } from "@/stores/event-actions-store";

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
		id: "vendors",
		label: "Vendors",
		title: "Event Vendors",
		description:
			"Manage vendors for this event.",
		icon: Building2,
		route: "vendors",
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
		id: "visitor-stamps",
		label: "Stamp Scanner",
		title: "Visitor Stamp Scanner",
		description:
			"Scan visitor QR codes to create stamps.",
		icon: ScanQrCode,
		route: "visitor-stamps",
	},
	{
		id: "analytics",
		label: "Analytics",
		title: "Analytics",
		description:
			"This page will display event analytics, charts, and insights.",
		icon: ChartBar,
		route: "analytics",
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
		return tabItems.filter((tab) => {
			// Always show these tabs
			if (["location", "analytics", "export-logs"].includes(tab.id)) {
				return true;
			}

			// Ticket-related tabs - only for ticket events
			if (["tickets", "pending-tickets", "scanned-logs"].includes(tab.id)) {
				return currentEvent?.use_ticket !== false;
			}

			// Event staff - only org_owner can manage
			if (tab.id === "event-staff") {
				return permissions.canManageEventStaff;
			}

			// Vendors tab - visible to event admins and vendors
			if (tab.id === "vendors") {
				return permissions.canViewVendorsTab;
			}

			// Visitors tab - only for non-ticket events, visible to event staff
			if (tab.id === "visitors") {
				return permissions.canViewVisitorsTab;
			}

			// Stamp scanner - only for non-ticket events, visible to vendors
			if (tab.id === "visitor-stamps") {
				return permissions.canViewStampScannerTab;
			}

			return true;
		});
	}, [currentEvent?.use_ticket, permissions]);

	// Extract the current tab from pathname.
	// For nested routes like /event/[id]/vendors/[vendor_id]/profile,
	// we still want the "vendors" tab to be active.
	const currentTab = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);

		// Walk from the end and find the first segment that matches a tab route
		for (let i = segments.length - 1; i >= 0; i--) {
			const segment = segments[i];
			if (visibleTabs.some((tab) => tab.route === segment)) {
				return segment;
			}
		}

		// Default to the first visible tab (usually "location")
		return visibleTabs[0]?.route ?? "location";
	}, [pathname, visibleTabs]);

	// Find the current tab item for dynamic header
	const currentTabItem = useMemo(() => {
		return visibleTabs.find((item) => item.route === currentTab) || visibleTabs[0];
	}, [currentTab, visibleTabs]);

	const handleTabChange = useCallback(
		(value: string) => {
			const path = `/event/${event_id}/${value}`;
			(router as AppRouterInstance).push(path);
		},
		[event_id, router],
	);

	// If no tabs are visible, show a message
	if (visibleTabs.length === 0) {
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
									title="Event Details"
									description={`Manage and view details for ${
										currentEvent?.title || `event ${event_id}`
									}`}
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
						<Select value={currentTab} onValueChange={handleTabChange}>
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
								{visibleTabs.map((item) => {
									const IconComponent = item.icon;
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
								{visibleTabs.map((item) => {
									const IconComponent = item.icon;
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
