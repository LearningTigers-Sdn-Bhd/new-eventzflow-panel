"use client";

import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/hooks/use-dialog";
import type { BaseLocation } from "./columns";
import AssignMembersDialog from "./assign-members/modal";
import DeleteLocationDialog from "./delete/modal";
import LocationSettingsDialog from "./edit/modal";

interface LocationActionsMenuProps {
	location: BaseLocation;
}

export function LocationActionsMenu({ location }: LocationActionsMenuProps) {
	const { openDialog } = useDialog();

	const openLocationSettings = () => {
		openDialog({
			component: LocationSettingsDialog,
			config: {
				title: "Location Settings",
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
		<ButtonGroup>
			<Button
				size="icon-sm"
				variant="outline"
				className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
				onClick={openLocationSettings}
				title="Edit Location"
			>
				<Pencil className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 [&_svg]:text-emerald-500 hover:[&_svg]:text-emerald-600"
				onClick={openAssignMembers}
				title="Assign Members"
			>
				<UserPlus className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
				onClick={openDeleteConfirmation}
				title="Delete Location"
			>
				<Trash2 className="size-4" />
			</Button>
		</ButtonGroup>
	);
}
