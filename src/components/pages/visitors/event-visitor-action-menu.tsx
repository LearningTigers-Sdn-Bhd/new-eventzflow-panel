"use client";

import { Eye, Pencil, QrCode, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import type { Visitor } from "@/lib/api/visitor";
import { DeleteVisitorDialog } from "./action-modals/delete-visitor-dialog";
import EditEventVisitorForm from "./action-modals/edit-event-visitor-form";
import VisitorQRModal from "./action-modals/qr-modal";
import ViewEventVisitorModal from "./action-modals/view-event-visitor-modal";

interface VisitorActionsMenuProps {
	visitor: Visitor;
}

export function VisitorActionsMenu({ visitor }: VisitorActionsMenuProps) {
	const { openDialog } = useDialog();
	const { user } = useAuth();
	const params = useParams();
	const eventId = params.event_id as string;
	const { isEventAdmin } = useEventPermissions(eventId);

	// Only org_owner, organizer, and event_admin can edit/delete
	const canEditDelete =
		user?.role === "org_owner" ||
		user?.role === "organizer" ||
		isEventAdmin;

	const openViewModal = () => {
		openDialog({
			component: ViewEventVisitorModal,
			config: {
				title: "View Visitor",
				size: "2xl",
				showCloseButton: true,
			},
			props: { visitor },
		});
	};

	const openEditModal = () => {
		openDialog({
			component: EditEventVisitorForm,
			config: {
				title: "Edit Visitor",
				description: "Update the visitor information",
				size: "full",
				showCloseButton: true,
			},
			props: { visitor },
		});
	};

	const openQRModal = () => {
		openDialog({
			component: VisitorQRModal,
			config: {
				title: "Visitor QR Code",
				size: "lg",
				showCloseButton: true,
			},
			props: { visitor },
		});
	};

	const openDeleteModal = () => {
		openDialog({
			component: DeleteVisitorDialog,
			config: {
				title: "Delete Visitor",
				size: "md",
				showCloseButton: true,
			},
			props: { visitor },
		});
	};

	return (
		<ButtonGroup>
			{canEditDelete && (
				<Button
					size="icon-sm"
					variant="outline"
					className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
					onClick={openEditModal}
					title="Edit Visitor"
				>
					<Pencil className="size-4" />
				</Button>
			)}
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
				onClick={openViewModal}
				title="View Visitor"
			>
				<Eye className="size-4" />
			</Button>
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-purple-500 hover:bg-purple-50 hover:text-purple-600 [&_svg]:text-purple-500 hover:[&_svg]:text-purple-600"
				onClick={openQRModal}
				title="View QR Code"
			>
				<QrCode className="size-4" />
			</Button>
			{canEditDelete && (
				<Button
					size="icon-sm"
					variant="outline"
					className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
					onClick={openDeleteModal}
					title="Delete Visitor"
				>
					<Trash2 className="size-4" />
				</Button>
			)}
		</ButtonGroup>
	);
}
