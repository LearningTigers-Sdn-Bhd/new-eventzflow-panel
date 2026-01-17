"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
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
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import type { BaseSession } from "../types";

export interface SessionActionMenuConfig<T extends BaseSession> {
	routeBuilder: (eventId: string, sessionId: number) => string;
	editDialogTitle: string;
	editDialogDescription: string;
	EditFormComponent: React.ComponentType<{ session: T }>;
	deleteMessage: string;
	deleteApiFunction: (eventId: string, sessionId: number) => Promise<void>;
	queryKey: (eventId: string) => (string | number)[];
}

interface SessionActionMenuProps<T extends BaseSession> {
	session: T;
	config: SessionActionMenuConfig<T>;
}

/**
 * Generic action menu component for session tables
 * Used by both lucky-draw and roulette
 */
export function SessionActionMenu<T extends BaseSession>({
	session,
	config,
}: SessionActionMenuProps<T>) {
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const router = useRouter();
	const params = useParams();
	const eventId = params.event_id as string;
	const queryClient = useQueryClient();

	const openSession = () => {
		router.push(config.routeBuilder(eventId, session.id) as Route);
	};

	const deleteMutation = useMutation({
		mutationFn: async () => config.deleteApiFunction(eventId, session.id),
		onSuccess: () => {
			toast.success("Session deleted successfully");
			queryClient.invalidateQueries({
				queryKey: config.queryKey(eventId),
			});
			closeDialog();
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error ? error.message : "Failed to delete session";
			toast.error(message);
		},
	});

	const handleDelete = () => {
		openConfirm({
			title: "Delete Session",
			message: `Are you sure you want to delete the session "${session.title}"? This action cannot be undone. ${config.deleteMessage}`,
			confirmLabel: "Delete Session",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			onConfirm: () => {
				deleteMutation.mutate();
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-none">
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="rounded-none bg-background">
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator className="rounded-none" />
				<DropdownMenuItem onClick={openSession} className="rounded-none">
					<Eye className="mr-2 h-4 w-4" />
					View / Open
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						openDialog({
							component: config.EditFormComponent,
							props: { session },
							config: {
								title: config.editDialogTitle,
								description: config.editDialogDescription,
								size: "full",
								showCloseButton: true,
							},
						})
					}
					className="rounded-none"
				>
					<Pencil className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>
				<DropdownMenuSeparator className="rounded-none" />
				<DropdownMenuItem
					className="rounded-none text-destructive focus:text-destructive"
					onClick={handleDelete}
				>
					<Trash className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
