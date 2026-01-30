"use client";

import {
	Archive,
	Eye,
	MoreVertical,
	Pencil,
	Trash2,
	Undo2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useSeatSessionMutation } from "@/hooks/seat-ticketing/use-session-mutation";
import type { SeatSessionRow } from "./seat-session-table-columns";
import SeatSessionEditModal from "./form-modals/seat-session-edit-modal";
import SeatSessionViewModal from "./form-modals/seat-session-view-modal";

interface SeatSessionActionMenuProps {
	session: SeatSessionRow;
}

export function SeatSessionActionMenu({ session }: SeatSessionActionMenuProps) {
	const { openDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const { user } = useAuth();
	const params = useParams();
	const eventId = params.event_id as string;
	const isVendor = user?.role === "vendor";
	const isArchived = session.archived ?? !!session.deleted_at;

	const { archiveMutation, restoreMutation, forceDeleteMutation } =
		useSeatSessionMutation({
			queryKey: ["seat-ticketing", "sessions", eventId],
		});

	const openView = () => {
		openDialog({
			component: SeatSessionViewModal,
			config: {
				title: "Seat Session Details",
				description: "View seat session details.",
				size: "lg",
			},
			props: { session },
		});
	};

	const openEdit = () => {
		openDialog({
			component: SeatSessionEditModal,
			config: {
				title: "Edit Seat Session",
				description: "Update seat session details.",
				size: "lg",
			},
			props: { session },
		});
	};

	const confirmArchive = () => {
		openConfirm({
			title: "Archive Seat Session",
			message:
				"Archived sessions can be restored later and will be hidden by default.",
			description: `Archive "${session.name}"?`,
			type: "warning",
			icon: "alert",
			confirmLabel: "Archive",
			onConfirm: async () => {
				await archiveMutation.mutateAsync(session.id);
			},
		});
	};

	const confirmRestore = () => {
		openConfirm({
			title: "Restore Seat Session",
			message: "Restore this session to make it active again.",
			description: `Restore "${session.name}"?`,
			type: "success",
			icon: "check",
			confirmLabel: "Restore",
			onConfirm: async () => {
				await restoreMutation.mutateAsync(session.id);
			},
		});
	};

	const confirmForceDelete = () => {
		openConfirm({
			title: "Delete Seat Session",
			message:
				"This action cannot be undone. The session will be permanently removed.",
			description: `Delete "${session.name}"?`,
			type: "destructive",
			icon: "delete",
			confirmLabel: "Delete",
			onConfirm: async () => {
				await forceDeleteMutation.mutateAsync(session.id);
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="size-8 rounded-none">
					<MoreVertical className="size-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48 rounded-none">
				<DropdownMenuItem onClick={openView}>
					<Eye className="mr-2 size-4" />
					View Details
				</DropdownMenuItem>
				{!isVendor && (
					<>
						<DropdownMenuItem onClick={openEdit}>
							<Pencil className="mr-2 size-4" />
							Edit Session
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{!isArchived ? (
							<DropdownMenuItem onClick={confirmArchive}>
								<Archive className="mr-2 size-4" />
								Archive
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem onClick={confirmRestore}>
								<Undo2 className="mr-2 size-4" />
								Restore
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={confirmForceDelete}
							className="rounded-none hover:bg-background/50"
						>
							<Trash2 className="mr-2 size-4 text-red-600" />
							<span className="text-red-600">Delete Permanently</span>
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
