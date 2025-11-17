"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChartBar,
	Cog,
	MapPin,
	MoreHorizontal,
	ScanQrCode,
	Users,
	Building2,
	UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { HiTicket } from "react-icons/hi2";
import { TbClockDollar } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { getEvents } from "@/lib/api/event";
import { cn } from "@/lib/utils";
import EventSettingsDialog from "./settings/modal";

interface EventActionsMenuProps {
	eventId: number;
}

type MenuItem = {
	id: string;
	name: string;
	icon: React.ComponentType<{ className?: string }>;
	route: string;
	className: string;
	showCondition?: "always" | "ticket" | "non-ticket" | "permission-based";
};

export function EventActionsMenu({ eventId }: EventActionsMenuProps) {
	const _router = useRouter();
	const { openDialog, closeDialog } = useDialog();

	// Fetch event details
	const { data: events } = useQuery({
		queryKey: ["events"],
		queryFn: getEvents,
	});
	const currentEvent = events?.find((event) => event.id === eventId);

	// Get event permissions for the current user
	const permissions = useEventPermissions(eventId.toString(), currentEvent);

	const allRouterItems: MenuItem[] = [
		{
			id: `view-location-id${eventId}`,
			name: "View Location",
			icon: MapPin,
			route: `/event/${eventId}/location`,
			className: "",
			showCondition: "always",
		},
		{
			id: `manage-tickets-id${eventId}`,
			name: "Manage Tickets",
			icon: HiTicket,
			route: `/event/${eventId}/tickets`,
			className: "",
			showCondition: "ticket",
		},
		{
			id: `pending-tickets-id${eventId}`,
			name: "Pending Tickets",
			icon: TbClockDollar,
			route: `/event/${eventId}/pending-tickets`,
			className: "",
			showCondition: "ticket",
		},
		{
			id: `scanned-logs-id${eventId}`,
			name: "Scanned Logs",
			icon: ScanQrCode,
			route: `/event/${eventId}/scanned-logs`,
			className: "",
			showCondition: "ticket",
		},
		{
			id: `visitors-id${eventId}`,
			name: "Visitors",
			icon: UserCheck,
			route: `/event/${eventId}/visitors`,
			className: "",
			showCondition: "non-ticket",
		},
		{
			id: `vendors-id${eventId}`,
			name: "Vendors",
			icon: Building2,
			route: `/event/${eventId}/vendors`,
			className: "",
			showCondition: "permission-based",
		},
		{
			id: `event-staff-id${eventId}`,
			name: "Event Staff",
			icon: Users,
			route: `/event/${eventId}/event-staff`,
			className: "",
			showCondition: "permission-based",
		},
		{
			id: `visitor-stamps-id${eventId}`,
			name: "Stamp Scanner",
			icon: ScanQrCode,
			route: `/event/${eventId}/visitor-stamps`,
			className: "",
			showCondition: "non-ticket",
		},
		{
			id: `analytics-id${eventId}`,
			name: "Analytics",
			icon: ChartBar,
			route: `/event/${eventId}/analytics`,
			className: "",
			showCondition: "always",
		},
		// {
		// 	id: `export-logs-id${eventId}`,
		// 	name: "Export Logs",
		// 	icon: Logs,
		// 	route: `/event/${eventId}/export-logs`,
		// 	className: "",
		// 	showCondition: "always",
		// },
	];

	// Filter menu items based on event type and permissions
	const routerItems = useMemo(() => {
		return allRouterItems.filter((item) => {
			// Always show these items
			if (item.showCondition === "always") {
				return true;
			}

			// Ticket-related items - only for ticket events
			if (item.showCondition === "ticket") {
				return currentEvent?.use_ticket !== false;
			}

			// Non-ticket items - only for non-ticket events
			if (item.showCondition === "non-ticket") {
				return currentEvent?.use_ticket === false;
			}

			// Permission-based items
			if (item.showCondition === "permission-based") {
				if (item.id.includes("event-staff")) {
					return permissions.canManageEventStaff;
				}
				if (item.id.includes("vendors")) {
					return permissions.canViewVendorsTab;
				}
			}

			return true;
		});
	}, [currentEvent?.use_ticket, permissions, allRouterItems, eventId]);

	const _openEventSettings = () => {
		openDialog({
			component: EventSettingsDialog,
			config: {
				title: "Event Settings",
				size: "full",
			},
			props: {
				eventId,
				onClose: closeDialog,
			},
		});
	};

	return (
		<ButtonGroup>
			<Button
				variant="outline"
				className="rounded-none"
				onClick={_openEventSettings}
			>
				<Cog className="h-4 w-4" />
				Manage
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="rounded-none px-2" variant="outline">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="center"
					side="left"
					className="rounded-none"
				>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{routerItems.map((item) => {
						const IconComponent = item.icon;
						return (
							<DropdownMenuItem
								key={item.id}
								className={cn(item.className, "rounded-none")}
								onClick={() => {
									_router.push(
										item.route as Parameters<typeof _router.push>[0],
									);
								}}
							>
								<IconComponent className="mr-2 h-4 w-4" />
								{item.name}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		</ButtonGroup>
	);
}
