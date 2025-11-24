"use client";

import { Eye, MoreVertical, Pencil, Store, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import AssignMembersDialog from "./assign-members/modal";
import AssignVendorDialog from "./assign-vendor/modal";
import type { BaseLocation } from "./columns";
import DeleteLocationDialog from "./delete/modal";
import LocationSettingsDialog from "./edit/modal";
import ViewDetailsDialog from "./view-details/modal";

interface LocationActionsMenuProps {
	location: BaseLocation;
}

export function LocationActionsMenu({ location }: LocationActionsMenuProps) {
	const { openDialog } = useDialog();
	const { user } = useAuth();
	const isVendor = user?.role === "vendor";

	const openViewDetails = () => {
		openDialog({
			component: ViewDetailsDialog,
			config: {
				title: "Location Details",
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
				size: "4xl", // Better for mobile - not too wide
			},
			props: { location },
		});
	};

	const openAssignMembers = () => {
		openDialog({
			component: AssignMembersDialog,
			config: {
				title: "Assign Members to Location",
				description: "Select team members to assign to this location",
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
			},
			props: { location },
		});
	};

	const openDeleteConfirmation = () => {
		openDialog({
			component: DeleteLocationDialog,
			config: {
				title: "Delete Location",
			},
			props: { location },
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="size-8"
				>
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
						<DropdownMenuItem onClick={openDeleteConfirmation} className="text-red-600">
							<Trash2 className="mr-2 size-4" />
							Delete Location
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

