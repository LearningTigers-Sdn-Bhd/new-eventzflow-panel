"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, MoreHorizontal, Pencil, QrCode, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import { deleteEventVendor } from "@/lib/api/event-vendor";
import type { EventVendor } from "@/lib/api/event-vendor";
import ConfirmDialog from "../../event-staff/confirm-dialog";
import EditEventVendorForm from "../forms/edit-vendor/edit-form";
import QrCodeDialog from "../dialogs/qr-code-dialog";

interface EventVendorActionsMenuProps {
	vendor: EventVendor;
}

export function EventVendorActionsMenu({
	vendor,
}: EventVendorActionsMenuProps) {
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

	const handleViewVendorClick = () => {
		router.push(`/event/${eventId}/vendors/${vendor.id}/profile`);
	};

	const handleQrCodeClick = () => {
		openDialog({
			component: QrCodeDialog,
			props: {
				vendor,
			},
			config: {
				title: "QR Code",
				size: "lg",
			},
		});
	};

	const handleDeleteClick = () => {
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
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon-sm" className="rounded-none">
					<MoreHorizontal className="size-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="rounded-none bg-background w-48"
			>
				<DropdownMenuItem
					onClick={handleEditClick}
					className="rounded-none cursor-pointer"
				>
					<Pencil className="mr-2 size-4" />
					Edit Form
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleViewVendorClick}
					className="rounded-none cursor-pointer"
				>
					<Eye className="mr-2 size-4" />
					View Vendor
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleQrCodeClick}
					className="rounded-none cursor-pointer"
				>
					<QrCode className="mr-2 size-4" />
					QR Code
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="rounded-none cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
				>
					<Trash2 className="mr-2 size-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
