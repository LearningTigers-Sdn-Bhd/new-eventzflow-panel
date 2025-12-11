"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { RentableItem } from "@/lib/api/rentable-item";
import { deleteRentableItem } from "@/lib/api/rentable-item";

interface DeleteRentableItemContentProps {
	item: RentableItem;
}

export function DeleteRentableItemContent({
	item,
}: DeleteRentableItemContentProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: () => deleteRentableItem({ id: item.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rentable-items"] });
			toast.success("Rentable item deleted successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to delete rentable item", {
				description: error.message,
			});
		},
	});

	const isPending = deleteMutation.isPending;

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-4">
				<div className="rounded-full bg-destructive/10 p-3">
					<AlertTriangle className="h-6 w-6 text-destructive" />
				</div>
				<div className="space-y-2">
					<p className="text-sm">
						Are you sure you want to delete the item{" "}
						<span className="font-semibold">"{item.name}"</span>?
					</p>
					<p className="text-muted-foreground text-sm">
						This action cannot be undone. Events using this item may be
						affected.
					</p>
				</div>
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={() => deleteMutation.mutate()}
					disabled={isPending}
				>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Delete
				</Button>
			</div>
		</div>
	);
}
