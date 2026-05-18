"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, Link2, Pencil, QrCode, RotateCcw, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { getEventById } from "@/lib/api/event";
import type { Visitor } from "@/lib/api/visitor";
import { DeleteVisitorDialog } from "./action-modals/delete-visitor-dialog";
import EditEventVisitorForm from "./action-modals/edit-event-visitor-form";
import VisitorQRModal from "./action-modals/qr-modal";
import { RsvpLinkModal } from "./action-modals/rsvp-link-modal";
import UnscanVisitorModal from "./action-modals/unscan-visitor-modal";
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

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
		enabled: !!eventId,
	});

	const isWeddingEvent = eventData?.use_wedding === true;
	const isPrimaryInvitee = !visitor.added_by_id;

	const openRsvpLinkModal = () => {
		if (!eventData?.slug) return;
		openDialog({
			component: RsvpLinkModal,
			config: {
				title: "RSVP Link",
				size: "lg",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { visitor, eventSlug: eventData.slug },
		});
	};

	// Only org_owner, organizer, and event_admin can edit/delete
	const canEditDelete =
		user?.role === "org_owner" || user?.role === "organizer" || isEventAdmin;

	const openViewModal = () => {
		openDialog({
			component: ViewEventVisitorModal,
			config: {
				title: "View Visitor",
				description: "View the visitor information.",
				size: "2xl",
				showCloseButton: true,
				className: "rounded-none",
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
				className: "rounded-none",
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
				className: "rounded-none",
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
				className: "rounded-none",
			},
			props: { visitor },
		});
	};

	const openUnscanModal = () => {
		openDialog({
			component: UnscanVisitorModal,
			config: {
				title: "Unscan Visitor",
				description: "Reset this visitor to not checked in status.",
				size: "lg",
				showCloseButton: true,
				className: "rounded-none",
			},
			props: { visitor },
		});
	};

	const showUnscanButton = user?.role === "org_owner" && visitor.checked_in;

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
			{isWeddingEvent && isPrimaryInvitee && (
				<Button
					size="icon-sm"
					variant="outline"
					className="rounded-none text-teal-500 hover:bg-teal-50 hover:text-teal-600 [&_svg]:text-teal-500 hover:[&_svg]:text-teal-600"
					onClick={openRsvpLinkModal}
					title="Copy RSVP Link"
				>
					<Link2 className="size-4" />
				</Button>
			)}
			{showUnscanButton && (
				<Button
					size="icon-sm"
					variant="outline"
					className="rounded-none text-amber-600 hover:bg-amber-50 hover:text-amber-700 [&_svg]:text-amber-600 hover:[&_svg]:text-amber-700"
					onClick={openUnscanModal}
					title="Unscan Visitor"
				>
					<RotateCcw className="size-4" />
				</Button>
			)}
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
