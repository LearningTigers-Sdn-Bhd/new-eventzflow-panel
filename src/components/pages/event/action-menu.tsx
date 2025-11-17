"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Archive,
	ChartBar,
	Cog,
	MapPin,
	MoreHorizontal,
	RotateCcw,
	ScanQrCode,
	Trash2,
	Users,
	Building2,
	UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import {
	archiveEvent,
	forceDeleteEvent,
	getEvents,
	restoreEvent,
} from "@/lib/api/event";
import { cn } from "@/lib/utils";
import EventSettingsDialog from "./settings/modal";
import ConfirmDialog from "./settings/confirm-dialog";

interface EventActionsMenuProps {
	eventId: number;
	deletedAt?: string | null;
}

type MenuItem = {
	id: string;
	name: string;
	icon: React.ComponentType<{ className?: string }>;
	route: string;
	className: string;
	showCondition?: "always" | "ticket" | "non-ticket" | "permission-based";
};

type CrudActionItem = {
	id: string;
	name: string;
	icon: React.ComponentType<{ className?: string }>;
	onClick: () => void;
	className: string;
	roleAllowed: string[];
	showInMenu: boolean;
};

export function EventActionsMenu({ eventId, deletedAt }: EventActionsMenuProps) {
	const _router = useRouter();
	const { openDialog, closeDialog } = useDialog();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const isArchived = !!deletedAt;

	// Fetch event details
	const { data: events } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
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
	}, [currentEvent?.use_ticket, permissions, eventId]);

	const archiveEventMutation = useMutation({
		mutationFn: archiveEvent,
		onSuccess: () => {
			toast.success("Event archived successfully!");
			queryClient.invalidateQueries({ queryKey: ["events"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to archive event");
		},
	});

	const deleteEventMutation = useMutation({
		mutationFn: forceDeleteEvent,
		onSuccess: () => {
			toast.success("Event deleted successfully!");
			queryClient.invalidateQueries({ queryKey: ["events"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete event");
		},
	});

	const restoreEventMutation = useMutation({
		mutationFn: restoreEvent,
		onSuccess: () => {
			toast.success("Event restored successfully!");
			queryClient.invalidateQueries({ queryKey: ["events"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to restore event");
		},
	});

	const handleArchiveClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to archive this event? The event will be archived and hidden from the main list.`,
				confirmLabel: "Archive",
				cancelLabel: "Cancel",
				variant: "warning",
				icon: "alert",
				onConfirm: () => {
					archiveEventMutation.mutate(eventId.toString());
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Archive Event",
				size: "sm",
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to permanently delete this event? This action cannot be undone and all associated data will be permanently removed.`,
				confirmLabel: "Delete",
				cancelLabel: "Cancel",
				variant: "destructive",
				icon: "delete",
				onConfirm: () => {
					deleteEventMutation.mutate(eventId.toString());
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Delete Event",
				size: "sm",
			},
		});
	};

	const handleRestoreClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to restore this event? The event will be unarchived and visible in the main list again.`,
				confirmLabel: "Restore",
				cancelLabel: "Cancel",
				variant: "success",
				icon: "check",
				onConfirm: () => {
					restoreEventMutation.mutate(eventId.toString());
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Restore Event",
				size: "sm",
			},
		});
	};

	const crudActions: CrudActionItem[] = [
		{
			id: `archive-event-id${eventId}`,
			name: "Archive Event",
			icon: Archive,
			onClick: handleArchiveClick,
			className: "",
			roleAllowed: ["org_owner", "organizer"],
			showInMenu: !isArchived,
		},
		{
			id: `delete-event-id${eventId}`,
			name: "Delete Event",
			icon: Trash2,
			onClick: handleDeleteClick,
			className: "text-red-600",
			roleAllowed: ["org_owner"],
			showInMenu: true,
		},
		{
			id: `restore-event-id${eventId}`,
			name: "Restore Event",
			icon: RotateCcw,
			onClick: handleRestoreClick,
			className: "",
			roleAllowed: ["org_owner", "organizer"],
			showInMenu: isArchived,
		},
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
					{(() => {
						const filteredActions = crudActions.filter(
							(action) =>
								action.roleAllowed.includes(user?.role || "member") &&
								action.showInMenu,
						);
						return filteredActions.length > 0 ? (
							<>
								<DropdownMenuSeparator />
								{filteredActions.map((action) => {
									const IconComponent = action.icon;
									return (
										<DropdownMenuItem
											key={action.id}
											className={cn(action.className, "rounded-none")}
											onClick={action.onClick}
										>
											<IconComponent className="mr-2 h-4 w-4" />
											{action.name}
										</DropdownMenuItem>
									);
								})}
							</>
						) : null;
					})()}
				</DropdownMenuContent>
			</DropdownMenu>
		</ButtonGroup>
	);
}
