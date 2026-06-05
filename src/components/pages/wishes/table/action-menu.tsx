"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { Wish } from "@/lib/api/wishes";
import { approveWish, deleteWish, rejectWish } from "@/lib/api/wishes";

interface WishesActionMenuProps {
	wish: Wish;
	eventId: string;
}

export function WishesActionMenu({ wish, eventId }: WishesActionMenuProps) {
	const queryClient = useQueryClient();
	const { openConfirm, closeDialog } = useConfirmDialog();

	const invalidateWishes = async () => {
		await queryClient.invalidateQueries({ queryKey: ["wishes", eventId] });
	};

	const approveMutation = useMutation({
		mutationFn: (wishId: number) => approveWish(eventId, wishId),
		onSuccess: invalidateWishes,
	});

	const rejectMutation = useMutation({
		mutationFn: (wishId: number) => rejectWish(eventId, wishId),
		onSuccess: invalidateWishes,
	});

	const deleteMutation = useMutation({
		mutationFn: (wishId: number) => deleteWish(eventId, wishId),
		onSuccess: invalidateWishes,
	});

	const busy =
		approveMutation.isPending ||
		rejectMutation.isPending ||
		deleteMutation.isPending;
	const isPending = wish.status === "pending";

	const handleDeleteClick = () => {
		openConfirm({
			title: "Delete Wish",
			message:
				"Are you sure you want to delete this wish? This action cannot be undone.",
			confirmLabel: "Delete",
			type: "destructive",
			icon: "alert",
			size: "sm",
			onConfirm: () => {
				deleteMutation.mutate(wish.id);
			},
			onCancel: closeDialog,
		});
	};

	return (
		<ButtonGroup>
			{isPending && (
				<>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 [&_svg]:text-emerald-600 hover:[&_svg]:text-emerald-700"
						onClick={() => approveMutation.mutate(wish.id)}
						disabled={busy}
						title="Approve"
					>
						<Check className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-rose-600 hover:bg-rose-50 hover:text-rose-700 [&_svg]:text-rose-600 hover:[&_svg]:text-rose-700"
						onClick={() => rejectMutation.mutate(wish.id)}
						disabled={busy}
						title="Reject"
					>
						<X className="size-4" />
					</Button>
				</>
			)}
			<Button
				size="icon-sm"
				variant="outline"
				className="rounded-none text-stone-600 hover:bg-red-50 hover:text-red-600 [&_svg]:text-stone-600 hover:[&_svg]:text-red-600"
				onClick={handleDeleteClick}
				disabled={busy}
				title="Delete"
			>
				<Trash2 className="size-4" />
			</Button>
		</ButtonGroup>
	);
}
