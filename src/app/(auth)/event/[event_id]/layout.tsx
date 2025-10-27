"use client";

import { useQuery } from "@tanstack/react-query";
import { ChartBar, MapPin, ScanQrCode, Users } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";
import { use, useCallback, useMemo } from "react";
import { HiTicket } from "react-icons/hi2";
import { TbClockDollar } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	icon: React.ComponentType<{ className?: string }>;
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
		id: "event-staff",
		label: "Event Staff",
		title: "Event Staff",
		description:
			"This page will display event staff assignments and management.",
		icon: Users,
		route: "event-staff",
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
	// {
	// 	id: "export-logs",
	// 	label: "Export Logs",
	// 	title: "Export Logs",
	// 	description:
	// 		"This page will provide options to export event logs and data.",
	// 	icon: Logs,
	// 	route: "export-logs",
	// },
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
		queryFn: getEvents,
	});
	const currentEvent = events?.find(
		(event) => event.id.toString() === event_id,
	);

	// Extract the current tab from pathname
	const pathSegments = pathname.split("/");
	const currentTab = pathSegments[pathSegments.length - 1] || "location";

	// Find the current tab item for dynamic header
	const currentTabItem = useMemo(() => {
		return tabItems.find((item) => item.route === currentTab) || tabItems[0];
	}, [currentTab]);

	const HeaderIcon = currentTabItem.icon;
	const CurrentTabIcon = currentTabItem.icon;

	const handleTabChange = useCallback(
		(value: string) => {
			const path = `/event/${event_id}/${value}`;
			(router as AppRouterInstance).push(path);
		},
		[event_id, router],
	);

	return (
		<div className="p-2">
			<div className="mb-6">
				<div className="mb-4">
					{isLoading ? (
						<>
							<Skeleton className="mb-2 h-9 w-64" />
							<Skeleton className="h-5 w-96" />
						</>
					) : (
						<>
							<h1 className="font-bold text-3xl tracking-tight">
								Event Details
							</h1>
							<div className="mt-1 flex items-center gap-2">
								<p className="text-muted-foreground">
									Manage and view details for{" "}
									{currentEvent?.title || `event ${event_id}`}
								</p>
								{currentEvent?.status && (
									<Badge
										variant={
											currentEvent.status === "published"
												? "default"
												: "secondary"
										}
									>
										{currentEvent.status === "published"
											? "Published"
											: "Draft"}
									</Badge>
								)}
							</div>
						</>
					)}
				</div>
				<div className="w-full">
					{isTablet ? (
						<Select value={currentTab} onValueChange={handleTabChange}>
							<SelectTrigger className="w-full h-12!">
								<SelectValue>
									<div className="flex items-center gap-2">
										<CurrentTabIcon className="size-4" />
										<span>{currentTabItem.label}</span>
									</div>
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{tabItems.map((item) => {
									const IconComponent = item.icon;
									return (
										<SelectItem
											key={item.id}
											value={item.route}
											className="h-10!"
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
							<TabsList className="flex w-full h-12">
								{tabItems.map((item) => {
									const IconComponent = item.icon;
									return (
										<TabsTrigger
											key={item.id}
											value={item.route}
											className="flex flex-1 items-center justify-center gap-2"
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
			<div className="rounded-lg border bg-card p-6">
				<div className="mb-4 flex items-center justify-between gap-3">
					<div className="flex w-full items-center gap-3">
						<div className="rounded-md border bg-muted p-2">
							<HeaderIcon className="h-6 w-6 text-muted-foreground" />
						</div>
						<div className="flex flex-col gap-1">
							<h2 className="font-bold text-xl">{currentTabItem.title}</h2>
							<p className="text-muted-foreground">
								{currentTabItem.description}
							</p>
						</div>
					</div>

					<EventActionsSlot />
				</div>
				{children}
			</div>
		</div>
	);
}
