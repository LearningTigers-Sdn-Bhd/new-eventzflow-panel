"use client";

import { useMutation } from "@tanstack/react-query";
import {
	Archive,
	MoreHorizontal,
	Pencil,
	RefreshCw,
	Repeat,
	RotateCcw,
	Trash2,
	Type,
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
import { useAuth } from "@/hooks/auth/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { getTicketById } from "@/lib/api/ticket";
import {
	archiveVehicle,
	deleteVehicle,
	restoreVehicle,
	syncVehicleBase,
	type VehicleCrewMember,
	type VehicleRegistration,
} from "@/lib/api/vehicle-registration";
import { cn } from "@/lib/utils";
import { queryClient } from "@/utils/rest-api";
import TicketEditModal from "../tickets/action-modals/edit-event-ticket-form";
import type { BaseTicket } from "../tickets/event-ticket-table-columns";
import { MoveVehicleGroupDialog } from "./move-vehicle-group-dialog";
import { RenameVehicleDialog } from "./rename-vehicle-dialog";

interface VehicleActionsMenuProps {
	eventId: string;
	vehicle: VehicleRegistration;
}

export function VehicleActionsMenu({
	eventId,
	vehicle,
}: VehicleActionsMenuProps) {
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const { user } = useAuth();

	const isArchived = vehicle.deletedAt != null;
	const canArchive =
		!isArchived && ["org_owner", "organizer"].includes(user?.role || "");
	const canRestore =
		isArchived && ["org_owner", "organizer"].includes(user?.role || "");
	const canDelete = user?.role === "org_owner";
	// Server refuses archive/delete while crew is attached; crew is active-only.
	const crewCount = vehicle.crew.length;
	const crewBlockHint = crewCount > 0 ? ` (move ${crewCount} crew first)` : "";

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: ["event", eventId, "vehicle-registrations"],
		});
		queryClient.invalidateQueries({ queryKey: ["event", eventId, "tickets"] });
		queryClient.invalidateQueries({
			queryKey: ["event", eventId, "pending-tickets"],
		});
	};

	const syncBaseMutation = useMutation({
		mutationFn: syncVehicleBase,
		onSuccess: () => {
			toast.success(`Fixed base ticket for ${vehicle.plate}.`);
			invalidate();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to fix base ticket");
		},
	});

	const hasStaleBase = vehicle.issues.some((i) => i.code === "stale_base");

	const openMoveGroup = () => {
		openDialog({
			component: MoveVehicleGroupDialog,
			props: { eventId, vehicle },
			config: {
				title: `Move ${vehicle.plate} to another group`,
				description: "Pick the new vehicle group for this car.",
				size: "md",
				showCloseButton: true,
				className: "rounded-none",
			},
		});
	};

	const openEditCrew = async (member: VehicleCrewMember) => {
		try {
			const ticket = await getTicketById(eventId, member.publicId);
			openDialog({
				component: TicketEditModal,
				config: {
					title: "Edit Ticket",
					description: "Edit the ticket information.",
					size: "full",
					showCloseButton: true,
				},
				props: {
					ticket: ticket as BaseTicket,
					hidePaymentStatus: member.paymentStatus !== "paid",
				},
			});
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to load ticket",
			);
		}
	};

	const openRename = () => {
		openDialog({
			component: RenameVehicleDialog,
			props: { eventId, vehicle },
			config: {
				title: `Rename ${vehicle.plate}`,
				description: "Update the plate number for this vehicle.",
				size: "md",
				showCloseButton: true,
				className: "rounded-none",
			},
		});
	};

	const archiveMutation = useMutation({
		mutationFn: archiveVehicle,
		onSuccess: () => {
			toast.success(`${vehicle.plate} archived.`);
			invalidate();
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to archive vehicle");
		},
	});

	const restoreMutation = useMutation({
		mutationFn: restoreVehicle,
		onSuccess: () => {
			toast.success(`${vehicle.plate} restored.`);
			invalidate();
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to restore vehicle");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteVehicle,
		onSuccess: () => {
			toast.success(`${vehicle.plate} deleted permanently.`);
			invalidate();
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete vehicle");
		},
	});

	const handleArchiveClick = () => {
		openConfirm({
			title: "Archive Vehicle",
			message: `Archive ${vehicle.plate}? It will be hidden from the list and its plate freed for new registrations.`,
			confirmLabel: "Archive",
			cancelLabel: "Cancel",
			type: "warning",
			icon: "alert",
			size: "sm",
			onConfirm: () =>
				archiveMutation.mutate({ eventId, vehicleRegistrationId: vehicle.id }),
			onCancel: closeDialog,
		});
	};

	const handleRestoreClick = () => {
		openConfirm({
			title: "Restore Vehicle",
			message: `Restore ${vehicle.plate}? It will show in the vehicles list again.`,
			confirmLabel: "Restore",
			cancelLabel: "Cancel",
			type: "success",
			icon: "check",
			size: "sm",
			onConfirm: () =>
				restoreMutation.mutate({ eventId, vehicleRegistrationId: vehicle.id }),
			onCancel: closeDialog,
		});
	};

	const handleDeleteClick = () => {
		openConfirm({
			title: "Delete Vehicle",
			message: `Permanently delete ${vehicle.plate}? This cannot be undone.`,
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			size: "sm",
			onConfirm: () =>
				deleteMutation.mutate({ eventId, vehicleRegistrationId: vehicle.id }),
			onCancel: closeDialog,
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon-sm"
					variant="outline"
					className="h-8 w-8 rounded-none p-0"
					disabled={syncBaseMutation.isPending}
					title="More Actions"
				>
					<MoreHorizontal className="size-4" />
					<span className="sr-only">Vehicle actions</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="rounded-none">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{!isArchived && (
					<DropdownMenuItem className="rounded-none" onClick={openRename}>
						<Type className="mr-2 size-4" />
						Rename plate
					</DropdownMenuItem>
				)}
				{!isArchived && (
					<DropdownMenuItem className="rounded-none" onClick={openMoveGroup}>
						<Repeat className="mr-2 size-4" />
						Move group
					</DropdownMenuItem>
				)}
				{hasStaleBase && (
					<DropdownMenuItem
						className="rounded-none"
						onClick={() =>
							syncBaseMutation.mutate({
								eventId,
								vehicleRegistrationId: vehicle.id,
							})
						}
						disabled={syncBaseMutation.isPending}
					>
						<RefreshCw className="mr-2 size-4" />
						Fix base ticket
					</DropdownMenuItem>
				)}
				{vehicle.crew.length > 0 && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuLabel>Crew</DropdownMenuLabel>
					</>
				)}
				{vehicle.crew.map((member) => (
					<DropdownMenuItem
						key={member.ticketId}
						className="rounded-none"
						onClick={() => openEditCrew(member)}
					>
						<Pencil className="mr-2 size-4" />
						Edit {member.name}
					</DropdownMenuItem>
				))}
				{(canArchive || canRestore || canDelete) && <DropdownMenuSeparator />}
				{canArchive && (
					<DropdownMenuItem
						className="rounded-none"
						onClick={handleArchiveClick}
						disabled={archiveMutation.isPending || crewCount > 0}
					>
						<Archive className="mr-2 size-4" />
						Archive vehicle{crewBlockHint}
					</DropdownMenuItem>
				)}
				{canRestore && (
					<DropdownMenuItem
						className="rounded-none"
						onClick={handleRestoreClick}
						disabled={restoreMutation.isPending}
					>
						<RotateCcw className="mr-2 size-4" />
						Restore vehicle
					</DropdownMenuItem>
				)}
				{canDelete && (
					<DropdownMenuItem
						className={cn("rounded-none text-red-600")}
						onClick={handleDeleteClick}
						disabled={deleteMutation.isPending || crewCount > 0}
					>
						<Trash2 className="mr-2 size-4" />
						Delete vehicle{crewBlockHint}
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
