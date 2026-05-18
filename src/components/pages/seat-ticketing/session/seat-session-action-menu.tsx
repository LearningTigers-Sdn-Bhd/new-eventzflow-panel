"use client";

import { Archive, Copy, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSeatSessionMutation } from "@/hooks/seat-ticketing/use-session-mutation";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import SeatSessionEditModal from "./form-modals/seat-session-edit-modal";
import SeatSessionViewModal from "./form-modals/seat-session-view-modal";
import type { SeatSessionRow } from "./seat-session-table-columns";

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

	const {
		archiveMutation,
		restoreMutation,
		forceDeleteMutation,
		duplicateMutation,
	} = useSeatSessionMutation({
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

	const confirmDuplicate = () => {
		openConfirm({
			title: "Duplicate Seat Session",
			message:
				"This will create a full copy of the session, including venues, sections, and seats.",
			description: `Duplicate "${session.name}"?`,
			type: "info",
			icon: "info",
			confirmLabel: "Duplicate",
			onConfirm: async () => {
				await duplicateMutation.mutateAsync(session.id);
			},
		});
	};

	return (
		<div className="py-2">
			<TooltipProvider delayDuration={0}>
				<ButtonGroup>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="rounded-none text-blue-600 hover:bg-blue-50 hover:text-blue-600"
								onClick={openView}
							>
								<Eye className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">View Details</TooltipContent>
					</Tooltip>

					{!isVendor && (
						<>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										className="rounded-none text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
										onClick={openEdit}
									>
										<Pencil className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">Edit Session</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										className="rounded-none text-slate-600 hover:bg-slate-50 hover:text-slate-600"
										disabled={duplicateMutation.isPending}
										onClick={confirmDuplicate}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">Duplicate Session</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										className={cn(
											"rounded-none",
											isArchived
												? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600"
												: "text-amber-600 hover:bg-amber-50 hover:text-amber-600",
										)}
										onClick={isArchived ? confirmRestore : confirmArchive}
									>
										{isArchived ? (
											<RotateCcw className="h-4 w-4" />
										) : (
											<Archive className="h-4 w-4" />
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									{isArchived ? "Restore" : "Archive"}
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										className="rounded-none text-red-600 hover:bg-red-50 hover:text-red-600"
										onClick={confirmForceDelete}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									Delete Permanently
								</TooltipContent>
							</Tooltip>
						</>
					)}
				</ButtonGroup>
			</TooltipProvider>
		</div>
	);
}
