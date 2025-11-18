"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Pencil,
	Power,
	PowerOff,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { toggleVendorStatus, deleteVendor } from "@/lib/api/vendor";
import type { Vendor } from "@/lib/api/vendor";
import ConfirmDialog from "../dialogs/confirm-dialog";
import EditVendorForm from "../dialogs/edit-vendor-form";

interface VendorActionsMenuProps {
	vendor: Vendor;
}

export function VendorActionsMenu({ vendor }: VendorActionsMenuProps) {
	const { openDialog, closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const { user } = useAuth();

	// Only org_owner and organizer can delete vendors
	const canDelete = user?.role === "org_owner" || user?.role === "organizer";

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

	const deleteMutation = useMutation({
		mutationFn: deleteVendor,
		onSuccess: () => {
			toast.success("Vendor deleted successfully!");
			queryClient.invalidateQueries({ queryKey: ["vendors"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete vendor");
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
				description: "Update vendor information and profile details",
				size: "full",
				showCloseButton: true,
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

	const handleDeleteClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to delete ${vendor.full_name}? This action cannot be undone and will permanently remove the vendor from the system.`,
				confirmLabel: "Delete",
				variant: "destructive",
				icon: "alert",
				onConfirm: () => {
					deleteMutation.mutate({
						id: vendor.id,
					});
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Delete Vendor",
				size: "sm",
			},
		});
	};

	return (
		<ButtonGroup>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
				onClick={handleEditClick}
				title="Edit Vendor"
			>
				<Pencil className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className={
					vendor.status === "active"
						? "rounded-none text-orange-500 hover:bg-orange-50 hover:text-orange-600 [&_svg]:text-orange-500 hover:[&_svg]:text-orange-600"
						: "rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
				}
				onClick={handleToggleStatusClick}
				title={vendor.status === "active" ? "Deactivate Vendor" : "Activate Vendor"}
			>
				{vendor.status === "active" ? (
					<PowerOff className="size-4" />
				) : (
					<Power className="size-4" />
				)}
			</Button>
			{canDelete && (
				<Button
					size="icon-sm"
					variant="outline"
					className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
					onClick={handleDeleteClick}
					title="Delete Vendor"
				>
					<Trash2 className="size-4" />
				</Button>
			)}
		</ButtonGroup>
	);
}
