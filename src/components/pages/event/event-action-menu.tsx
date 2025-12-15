"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Cog, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import {
	type MenuItem as ConfigMenuItem,
	eventMenuConfig,
} from "@/components/admin-ui/sidebar/event-menu-config";
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
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import {
	archiveEvent,
	forceDeleteEvent,
	getEvents,
	restoreEvent,
} from "@/lib/api/event";
import type { Event } from "@/lib/api/event/response";
import { cn } from "@/lib/utils";
import EventSettingsDialog from "./settings/edit-modal";

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

/**
 * Transforms event menu config items to action menu format
 * @param eventId - Event ID for building full routes
 * @param event - Current event data
 */
function transformConfigToMenuItems(
	eventId: number,
	event?: Event,
): MenuItem[] {
	// Routes to exclude from action menu (if needed)
	const excludedRoutes = new Set<string>([]);

	// Label overrides for action menu context
	const labelOverrides: Record<string, string> = {
		location: "View Location",
		vendors: "Assign Vendor",
		exhibitor: "Assign Exhibitor",
		"visitor-stamps": "Stamp Scanner",
	};

	// Flatten all config items
	const allItems: ConfigMenuItem[] = [
		...eventMenuConfig.standalone,
		...eventMenuConfig.groups.flatMap((group) => group.tabs),
	];

	return allItems
		.filter((item) => !excludedRoutes.has(item.route))
		.map((item) => ({
			id: `${item.route}-id${eventId}`,
			name: labelOverrides[item.route] || item.label,
			icon: item.icon,
			route: `/event/${eventId}/${item.route}`,
			className: "",
			featureKey: item.route,
			shouldDisplay: item.visible
				? (context: MenuContext) =>
						item.visible?.(context.permissions, event) ?? true
				: undefined,
		}));
}

export function EventActionsMenu({
	eventId,
	deletedAt,
}: EventActionsMenuProps) {
	const router = useRouter();
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
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

		// Transform shared config to action menu format
		const allRouterItems = transformConfigToMenuItems(eventId, currentEvent);

		const filteredItems = allRouterItems.filter((item) =>
			item.shouldDisplay ? item.shouldDisplay(menuContext) : true,
		);

		// Apply vendor-specific filtering
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
	}, [currentEvent, permissions, eventId, isVendor]);

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
		openConfirm({
			title: "Archive Event",
			message:
				"Are you sure you want to archive this event? The event will be archived and hidden from the main list.",
			confirmLabel: "Archive",
			cancelLabel: "Cancel",
			type: "warning",
			rounded: "no-rounded",
			icon: "alert",
			size: "sm",
			onConfirm: () => {
				archiveEventMutation.mutate(eventId.toString());
			},
		});
	};

	const handleDeleteClick = () => {
		openConfirm({
			title: "Delete Event",
			message:
				"Are you sure you want to permanently delete this event? This action cannot be undone and all associated data will be permanently removed.",
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			rounded: "no-rounded",
			icon: "delete",
			size: "sm",
			onConfirm: () => {
				deleteEventMutation.mutate(eventId.toString());
			},
		});
	};

	const handleRestoreClick = () => {
		openConfirm({
			title: "Restore Event",
			message:
				"Are you sure you want to restore this event? The event will be unarchived and visible in the main list again.",
			confirmLabel: "Restore",
			cancelLabel: "Cancel",
			type: "success",
			rounded: "no-rounded",
			icon: "check",
			size: "sm",
			onConfirm: () => {
				restoreEventMutation.mutate(eventId.toString());
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

	const openEventSettings = () => {
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

	// For vendors and exhibition contractors, redirect to their profile pages instead of opening settings
	const handleMainButtonClick = () => {
		if (isVendor) {
			router.push(
				`/event/${eventId}/my-profile` as Parameters<typeof router.push>[0],
			);
		} else if (isExhibitionContractor) {
			router.push(
				`/event/${eventId}/exhibitor-contractor` as Parameters<
					typeof router.push
				>[0],
			);
		} else {
			openEventSettings();
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
										router.push(
											item.route as Parameters<typeof router.push>[0],
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
