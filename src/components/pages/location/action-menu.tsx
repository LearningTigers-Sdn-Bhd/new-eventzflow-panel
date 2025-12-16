"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Eye,
	MoreVertical,
	Pencil,
	Store,
	Trash2,
	UserPlus,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useIsTablet } from "@/hooks/use-tablet";
import { deleteLocation } from "@/lib/api/event/location";
import AssignMembersDialog from "./event-location-action-modal/assign-member-modal";
import AssignVendorDialog from "./event-location-action-modal/assign-vendor-modal";
import LocationSettingsDialog from "./event-location-action-modal/edit-event-location-modal";
import ViewDetailsDialog from "./event-location-action-modal/view-event-location-modal";
import type { BaseLocation } from "./event-location-table-columns";

interface LocationActionsMenuProps {
	location: BaseLocation;
}

export function LocationActionsMenu({ location }: LocationActionsMenuProps) {
	const isTablet = useIsTablet();
	const { openDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const { user } = useAuth();
	const params = useParams();
	const eventId = params.event_id as string;
	const queryClient = useQueryClient();
	const isVendor = user?.role === "vendor";

	const openViewDetails = () => {
		openDialog({
			component: ViewDetailsDialog,
			config: {
				title: "Location Details",
				description: "View the details of the location for this event.",
				size: "lg",
			},
			props: { location },
		});
	};

	const openLocationSettings = () => {
		openDialog({
			component: LocationSettingsDialog,
			config: {
				title: "Location Settings",
				description:
					"Edit the information and configurations of the location for this event.",
				size: "full",
			},
			props: { location },
		});
	};

	const openAssignMembers = () => {
		openDialog({
			component: AssignMembersDialog,
			config: {
				title: "Assign Members to Location",
				description:
					"Select team members to assign to this location for this event.",
				size: isTablet ? "full" : "lg",
			},
			props: { location },
		});
	};

	const openAssignVendor = () => {
		openDialog({
			component: AssignVendorDialog,
			config: {
				title: "Assign Vendor to Location",
				description: "Select a vendor to assign to this location",
				size: isTablet ? "full" : "lg",
			},
			props: { location },
		});
	};

	// Delete location mutation
	const deleteLocationMutation = useMutation({
		mutationFn: async () => {
			return await deleteLocation({
				eventId,
				locationId: location.id,
			});
		},
		onSuccess: () => {
			toast.success("Location deleted successfully");
			// Invalidate and refetch locations
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "locations"],
			});
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete location: ${error.message}`);
		},
	});

	const openDeleteConfirmation = () => {
		openConfirm({
			title: "Delete Location",
			message:
				"This action cannot be undone. This will permanently delete the location and remove all associated data.",
			description: `Are you sure you want to delete "${location.name}"?`,
			type: "destructive",
			icon: "delete",
			confirmLabel: deleteLocationMutation.isPending
				? "Deleting..."
				: "Delete Location",
			onConfirm: async () => {
				await deleteLocationMutation.mutateAsync();
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="size-8">
					<MoreVertical className="size-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={openViewDetails}>
					<Eye className="mr-2 size-4" />
					View Details
				</DropdownMenuItem>

				{/* Only show edit/assign/delete for non-vendors */}
				{!isVendor && (
					<>
						<DropdownMenuItem onClick={openLocationSettings}>
							<Pencil className="mr-2 size-4" />
							Edit Location
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={openAssignMembers}>
							<UserPlus className="mr-2 size-4" />
							Assign Members
						</DropdownMenuItem>
						<DropdownMenuItem onClick={openAssignVendor}>
							<Store className="mr-2 size-4" />
							Assign Vendors
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={openDeleteConfirmation}
							className="text-red-600"
						>
							<Trash2 className="mr-2 size-4" />
							Delete Location
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
