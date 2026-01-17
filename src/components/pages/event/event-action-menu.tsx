"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/auth/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
	archiveEvent,
	forceDeleteEvent,
	getEvents,
	restoreEvent,
} from "@/lib/api/event";
import EventSettingsDialog from "./settings/edit-modal";

interface EventActionsMenuProps {
	eventId: number;
	deletedAt?: string | null;
}

export function EventActionsMenu({
	eventId,
	deletedAt,
}: EventActionsMenuProps) {
	const router = useRouter();
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const isArchived = !!deletedAt;

	// Fetch event details
	const { data: events } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});
	const currentEvent = events?.find((event) => event.id === eventId);

	const isVendor = user?.role === "vendor";
	const isExhibitionContractor = user?.role === "exhibition_contractor";
	const userRole = user?.role || "member";

	const archiveEventMutation = useMutation({
		mutationFn: archiveEvent,
		onSuccess: () => {
			toast.success("Event archived successfully!");
			queryClient.invalidateQueries({ queryKey: ["events"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to archive event");
		},
	});

	const deleteEventMutation = useMutation({
		mutationFn: forceDeleteEvent,
		onSuccess: () => {
			toast.success("Event deleted successfully!");
			queryClient.invalidateQueries({ queryKey: ["events"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete event");
		},
	});

	const restoreEventMutation = useMutation({
		mutationFn: restoreEvent,
		onSuccess: () => {
			toast.success("Event restored successfully!");
			queryClient.invalidateQueries({ queryKey: ["events"] });
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to restore event");
		},
	});

	const handleArchiveClick = () => {
		openConfirm({
			title: "Archive Event",
			message:
				"Are you sure you want to archive this event? The event will be archived and hidden from the main list.",
			confirmLabel: "Archive",
			cancelLabel: "Cancel",
			type: "warning",
			rounded: "no-rounded",
			icon: "alert",
			size: "sm",
			onConfirm: () => {
				archiveEventMutation.mutate(eventId.toString());
			},
		});
	};

	const handleDeleteClick = () => {
		openConfirm({
			title: "Delete Event",
			message:
				"Are you sure you want to permanently delete this event? This action cannot be undone and all associated data will be permanently removed.",
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			rounded: "no-rounded",
			icon: "delete",
			size: "sm",
			onConfirm: () => {
				deleteEventMutation.mutate(eventId.toString());
			},
		});
	};

	const handleRestoreClick = () => {
		openConfirm({
			title: "Restore Event",
			message:
				"Are you sure you want to restore this event? The event will be unarchived and visible in the main list again.",
			confirmLabel: "Restore",
			cancelLabel: "Cancel",
			type: "success",
			rounded: "no-rounded",
			icon: "check",
			size: "sm",
			onConfirm: () => {
				restoreEventMutation.mutate(eventId.toString());
			},
		});
	};

	const openEventSettings = () => {
		openDialog({
			component: EventSettingsDialog,
			config: {
				title: "Event Settings",
				size: "full",
			},
			props: {
				eventId,
				onClose: closeDialog,
			},
		});
	};

	// For vendors and exhibition contractors, redirect to their profile pages instead of opening settings
	const handleMainButtonClick = () => {
		if (isVendor) {
			router.push(
				`/event/${eventId}/vendor-profile` as Parameters<typeof router.push>[0],
			);
		} else if (isExhibitionContractor) {
			router.push(
				`/event/${eventId}/contractor-profile` as Parameters<
					typeof router.push
				>[0],
			);
		} else {
			openEventSettings();
		}
	};

	// Determine if user should see "View" button instead of "Manage"
	const shouldShowViewButton = isVendor || isExhibitionContractor;

	// Permission checks
	const canArchiveRestore = ["org_owner", "organizer"].includes(userRole);
	const canDelete = ["org_owner"].includes(userRole);

	return (
		<TooltipProvider delayDuration={0}>
			<ButtonGroup>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none"
							onClick={handleMainButtonClick}
						>
							{shouldShowViewButton ? (
								<Eye className="h-4 w-4" />
							) : (
								<Pencil className="h-4 w-4" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{shouldShowViewButton ? "View" : "Manage"}
					</TooltipContent>
				</Tooltip>

				{canArchiveRestore && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="rounded-none"
								onClick={isArchived ? handleRestoreClick : handleArchiveClick}
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
				)}

				{canDelete && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="rounded-none text-red-600 hover:text-red-600"
								onClick={handleDeleteClick}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Delete</TooltipContent>
					</Tooltip>
				)}
			</ButtonGroup>
		</TooltipProvider>
	);
}