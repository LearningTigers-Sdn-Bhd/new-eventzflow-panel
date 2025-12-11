"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Archive,
	Building2,
	ChartBar,
	Cog,
	Logs,
	MapPin,
	MoreHorizontal,
	RotateCcw,
	ScanQrCode,
	Ticket,
	Trash2,
	TrendingUp,
	UserCheck,
	Users,
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

type MenuContext = {
	isTicketEvent: boolean;
	isNonTicketEvent: boolean;
	isVendorUser: boolean;
	permissions: ReturnType<typeof useEventPermissions>;
};

type MenuItem = {
	id: string;
	name: string;
	icon: React.ComponentType<{ className?: string }>;
	route: string;
	className: string;
	featureKey: string;
	shouldDisplay?: (context: MenuContext) => boolean;
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
	const isVendor = user?.role === "vendor";
	const isExhibitionContractor = user?.role === "exhibition_contractor";

	// Filter menu items based on event type and permissions
	const routerItems = useMemo(() => {
		const isTicketEvent = currentEvent?.use_ticket !== false;
		const isNonTicketEvent = !isTicketEvent;
		const menuContext: MenuContext = {
			isTicketEvent,
			isNonTicketEvent,
			isVendorUser: isVendor,
			permissions,
		};

		const allRouterItems: MenuItem[] = [
			// === BASIC INFO ===
			{
				id: `view-location-id${eventId}`,
				name: "View Location",
				icon: MapPin,
				route: `/event/${eventId}/location`,
				className: "",
				featureKey: "location",
			},
			
			// === TICKET MANAGEMENT (for ticket events) ===
			{
				id: `manage-tickets-id${eventId}`,
				name: "Manage Tickets",
				icon: HiTicket,
				route: `/event/${eventId}/tickets`,
				className: "",
				featureKey: "tickets",
				shouldDisplay: ({ isTicketEvent }) => isTicketEvent,
			},
			{
				id: `pending-tickets-id${eventId}`,
				name: "Pending Tickets",
				icon: TbClockDollar,
				route: `/event/${eventId}/pending-tickets`,
				className: "",
				featureKey: "pending-tickets",
				shouldDisplay: ({ isTicketEvent }) => isTicketEvent,
			},
			{
				id: `scanned-logs-id${eventId}`,
				name: "Scanned Logs",
				icon: ScanQrCode,
				route: `/event/${eventId}/scanned-logs`,
				className: "",
				featureKey: "scanned-logs",
				shouldDisplay: ({ isTicketEvent }) => isTicketEvent,
			},
			
			// === VISITOR MANAGEMENT (for non-ticket events) ===
			{
				id: `visitors-id${eventId}`,
				name: "Visitors",
				icon: UserCheck,
				route: `/event/${eventId}/visitors`,
				className: "",
				featureKey: "visitors",
				shouldDisplay: ({ permissions }) => Boolean(permissions.canViewVisitorsTab),
			},
			
			// === STAFF MANAGEMENT ===
			{
				id: `event-staff-id${eventId}`,
				name: "Event Staff",
				icon: Users,
				route: `/event/${eventId}/event-staff`,
				className: "",
				featureKey: "event-staff",
				shouldDisplay: ({ permissions }) => Boolean(permissions.canManageEventStaff),
			},
			
			// === VENDOR & VOUCHER MANAGEMENT ===
			// Show "Assign Exhibitor" when use_exhibitor_kit is true, otherwise "Assign Vendor"
			...(currentEvent?.use_exhibitor_kit === true
				? [
						{
							id: `exhibitor-id${eventId}`,
							name: "Assign Exhibitor",
							icon: Building2,
							route: `/event/${eventId}/exhibitor`,
							className: "",
							featureKey: "exhibitor",
							shouldDisplay: ({ permissions }: MenuContext) =>
								Boolean(permissions.canViewVendorsTab),
						},
					]
				: [
						{
							id: `vendors-id${eventId}`,
							name: "Assign Vendor",
							icon: Building2,
							route: `/event/${eventId}/vendors`,
							className: "",
							featureKey: "vendors",
							shouldDisplay: ({ permissions }: MenuContext) =>
								Boolean(permissions.canViewVendorsTab),
						},
					]),
			{
				id: `vouchers-id${eventId}`,
				name: "Vouchers",
				icon: Ticket,
				route: `/event/${eventId}/vouchers`,
				className: "",
				featureKey: "vouchers",
				shouldDisplay: ({ permissions }) => Boolean(permissions.canViewVendorsTab),
			},
			{
				id: `voucher-redemption-id${eventId}`,
				name: "Scan Voucher",
				icon: ScanQrCode,
				route: `/event/${eventId}/voucher-redemption`,
				className: "",
				featureKey: "voucher-redemption",
				shouldDisplay: ({ permissions }) => Boolean(permissions.isEventVendor),
			},
			{
				id: `voucher-logs-id${eventId}`,
				name: "Voucher Logs",
				icon: Logs,
				route: `/event/${eventId}/voucher-logs`,
				className: "",
				featureKey: "voucher-logs",
				shouldDisplay: ({ permissions }) =>
					Boolean(permissions.canManageEventVendors || permissions.canManageEventStaff),
			},
			{
				id: `visitor-stamps-id${eventId}`,
				name: "Stamp Scanner",
				icon: ScanQrCode,
				route: `/event/${eventId}/visitor-stamps`,
				className: "",
				featureKey: "visitor-stamps",
				shouldDisplay: ({ permissions }) => Boolean(permissions.isEventVendor),
			},
			{
				id: `stamp-logs-id${eventId}`,
				name: "Stamp Logs",
				icon: Logs,
				route: `/event/${eventId}/stamp-logs`,
				className: "",
				featureKey: "stamp-logs",
				shouldDisplay: ({ isNonTicketEvent, permissions }) =>
					Boolean(isNonTicketEvent && (permissions.canManageEventVendors || permissions.canManageEventStaff)),
			},
			
			// === ANALYTICS & INSIGHTS ===
			{
				id: `analytics-id${eventId}`,
				name: "Ticket Analytics",
				icon: ChartBar,
				route: `/event/${eventId}/analytics`,
				className: "",
				featureKey: "analytics",
				shouldDisplay: ({ isTicketEvent }) => isTicketEvent,
			},
			{
				id: `voucher-analytics-id${eventId}`,
				name: "Voucher Analytics",
				icon: ChartBar,
				route: `/event/${eventId}/voucher-analytics`,
				className: "",
				featureKey: "voucher-analytics",
				shouldDisplay: ({ permissions }) =>
					Boolean(permissions.isEventVendor || permissions.canManageEventVendors),
			},
			{
				id: `mall-live-feed-id${eventId}`,
				name: "Mall Live Feed",
				icon: TrendingUp,
				route: `/event/${eventId}/mall-live-feed`,
				className: "",
				featureKey: "mall-live-feed",
				shouldDisplay: ({ isNonTicketEvent, permissions }) =>
					Boolean(isNonTicketEvent && !permissions.isEventVendor),
			},
			
			// === DATA EXPORT ===
			{
				id: `export-logs-id${eventId}`,
				name: "Export Logs",
				icon: Logs,
				route: `/event/${eventId}/export-logs`,
				className: "",
				featureKey: "export-logs",
				shouldDisplay: ({ isTicketEvent, permissions }) => 
					Boolean(isTicketEvent && !permissions.isEventVendor),
			},
		];

		const filteredItems = allRouterItems.filter((item) =>
			item.shouldDisplay ? item.shouldDisplay(menuContext) : true,
		);

		if (permissions.isEventVendor && !permissions.canManageEventVendors) {
			const vendorVisibleFeatures = new Set([
				"vendors",
				"exhibitor",
				"vouchers",
				"voucher-redemption",
				"voucher-analytics",
				"visitor-stamps",
			]);

			return filteredItems.filter((item) =>
				vendorVisibleFeatures.has(item.featureKey),
			);
		}

		return filteredItems;
	}, [currentEvent?.use_ticket, currentEvent?.use_exhibitor_kit, permissions, eventId, isVendor]);

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
				message: "Are you sure you want to archive this event? The event will be archived and hidden from the main list.",
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
				message: "Are you sure you want to permanently delete this event? This action cannot be undone and all associated data will be permanently removed.",
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
				message: "Are you sure you want to restore this event? The event will be unarchived and visible in the main list again.",
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

	// For vendors and exhibition contractors, redirect to vendors tab instead of opening settings
	const handleMainButtonClick = () => {
		if (isVendor) {
			_router.push(`/event/${eventId}/vendors` as Parameters<typeof _router.push>[0]);
		} else if (isExhibitionContractor) {
			_router.push(`/event/${eventId}/exhibitor-contractor` as Parameters<typeof _router.push>[0]);
		} else {
			_openEventSettings();
		}
	};

	// Determine if user should see "View" button instead of "Manage"
	const shouldShowViewButton = isVendor || isExhibitionContractor;

	return (
		<ButtonGroup>
			<Button
				variant="outline"
				className="rounded-none"
				onClick={handleMainButtonClick}
			>
				<Cog className="h-4 w-4" />
				{shouldShowViewButton ? "View" : "Manage"}
			</Button>
			{!shouldShowViewButton && (
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
			)}
		</ButtonGroup>
	);
}
