"use client";

import {
	ChartBar,
	Cog,
	MapPin,
	MoreHorizontal,
	ScanQrCode,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
};

export function EventActionsMenu({ eventId }: EventActionsMenuProps) {
	const _router = useRouter();
	const { openDialog, closeDialog } = useDialog();

	const routerItems: MenuItem[] = [
		{
			id: `view-location-id${eventId}`,
			name: "View Location",
			icon: MapPin,
			route: `/event/${eventId}/location`,
			className: "",
		},
		{
			id: `manage-tickets-id${eventId}`,
			name: "Manage Tickets",
			icon: HiTicket,
			route: `/event/${eventId}/tickets`,
			className: "",
		},
		{
			id: `pending-tickets-id${eventId}`,
			name: "Pending Tickets",
			icon: TbClockDollar,
			route: `/event/${eventId}/pending-tickets`,
			className: "",
		},
		{
			id: `scanned-logs-id${eventId}`,
			name: "Scanned Logs",
			icon: ScanQrCode,
			route: `/event/${eventId}/scanned-logs`,
			className: "",
		},
		{
			id: `event-staff-id${eventId}`,
			name: "Event Staff",
			icon: Users,
			route: `/event/${eventId}/event-staff`,
			className: "",
		},
		{
			id: `analytics-id${eventId}`,
			name: "Analytics",
			icon: ChartBar,
			route: `/event/${eventId}/analytics`,
			className: "",
		},
		// {
		// 	id: `export-logs-id${eventId}`,
		// 	name: "Export Logs",
		// 	icon: Logs,
		// 	route: `/event/${eventId}/export-logs`,
		// 	className: "",
		// },
	];

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
