"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CheckCircle,
	MoreHorizontal,
	Pencil,
	PowerOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import { toggleVendorStatus } from "@/lib/api/vendor";
import type { Vendor } from "@/lib/api/vendor";
import ConfirmDialog from "./confirm-dialog";
import EditVendorForm from "./edit-vendor-form";

interface VendorActionsMenuProps {
	vendor: Vendor;
}

export function VendorActionsMenu({ vendor }: VendorActionsMenuProps) {
	const { openDialog, closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const toggleStatusMutation = useMutation({
		mutationFn: toggleVendorStatus,
		onSuccess: (_, variables) => {
			const action =
				variables.status === "inactive" ? "deactivated" : "activated";
			toast.success(`Vendor ${action} successfully!`);
			queryClient.invalidateQueries({ queryKey: ["vendors"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update vendor status");
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: EditVendorForm,
			props: {
				vendor,
				onClose: closeDialog,
			},
			config: {
				title: "Edit Vendor",
				description: "Update vendor information and credentials",
				size: "2xl",
			},
		});
	};

	const handleToggleStatusClick = () => {
		const isActive = vendor.status === "active";
		const newStatus = isActive ? "inactive" : "active";
		const action = isActive ? "deactivate" : "activate";

		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to ${action} ${vendor.full_name}? ${
					isActive
						? "They will no longer be able to access the system."
						: "They will be able to access the system again."
				}`,
				confirmLabel: isActive ? "Deactivate" : "Activate",
				variant: isActive ? "warning" : "success",
				icon: isActive ? "alert" : "check",
				onConfirm: () => {
					toggleStatusMutation.mutate({
						id: vendor.id,
						status: newStatus,
					});
				},
				onCancel: closeDialog,
			},
			config: {
				title: `${isActive ? "Deactivate" : "Activate"} Vendor`,
				size: "sm",
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 rounded-none p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" side="left" className="rounded-none">
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator className="rounded-none" />
				<DropdownMenuItem className="rounded-none" onClick={handleEditClick}>
					<Pencil className="mr-2 h-4 w-4" />
					Edit Vendor
				</DropdownMenuItem>
				<DropdownMenuItem
					className="rounded-none"
					onClick={handleToggleStatusClick}
				>
					{vendor.status === "active" ? (
						<>
							<PowerOff className="mr-2 h-4 w-4" />
							Deactivate Vendor
						</>
					) : (
						<>
							<CheckCircle className="mr-2 h-4 w-4" />
							Activate Vendor
						</>
					)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
