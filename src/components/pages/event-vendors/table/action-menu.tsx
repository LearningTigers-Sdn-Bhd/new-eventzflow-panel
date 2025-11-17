"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Eye, Pencil } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/hooks/use-dialog";
import { deleteEventVendor } from "@/lib/api/event-vendor";
import type { EventVendor } from "@/lib/api/event-vendor";
import ConfirmDialog from "../../event-staff/confirm-dialog";
import EditEventVendorForm from "../forms/edit-vendor/edit-form";

interface EventVendorActionsMenuProps {
	vendor: EventVendor;
}

export function EventVendorActionsMenu({ vendor }: EventVendorActionsMenuProps) {
	const router = useRouter();
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();

	const queryClient = useQueryClient();
	const deleteVendorMutation = useMutation({
		mutationFn: (vendorId: number) =>
			deleteEventVendor(Number(eventId), vendorId),
		onSuccess: () => {
			toast.success("Vendor removed from event successfully!");
			// Invalidate and refetch event vendors query
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vendors"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove vendor");
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: EditEventVendorForm,
			props: {
				vendor,
			},
			config: {
				title: "Edit Vendor",
				size: "2xl",
			},
		});
	};

	const handleViewProfile = () => {
		router.push(`/event/${eventId}/vendors/${vendor.id}/profile`);
	};

	const handleRemoveClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to remove ${vendor.vendor.full_name} from this event? They will no longer have access to this event's vendor functions.`,
				confirmLabel: "Remove",
				cancelLabel: "Cancel",
				variant: "destructive",
				icon: "delete",
				onConfirm: () => {
					deleteVendorMutation.mutate(vendor.id);
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Remove Vendor",
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
				className="rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
				onClick={handleViewProfile}
				title="View Profile"
			>
				<Eye className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
				onClick={handleRemoveClick}
				title="Remove from Event"
			>
				<Trash2 className="size-4" />
			</Button>
		</ButtonGroup>
	);
}
