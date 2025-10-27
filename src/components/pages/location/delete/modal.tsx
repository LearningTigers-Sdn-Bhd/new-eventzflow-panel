"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { deleteLocation } from "@/lib/api/event/location";
import type { BaseLocation } from "../columns";

interface DeleteLocationDialogProps {
	location: BaseLocation;
	onClose?: () => void;
}

export default function DeleteLocationDialog({
	location,
	onClose,
}: DeleteLocationDialogProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	// Delete location mutation
	const deleteLocationMutation = useMutation({
		mutationFn: async () => {
			return await deleteLocation({
				eventId,
				locationId: location.id,
			});
		},
		onSuccess: () => {
			toast.success("Location deleted successfully");
			// Invalidate and refetch locations
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "locations"],
			});
			// Close dialog
			closeDialog();
			if (onClose) onClose();
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete location: ${error.message}`);
		},
	});

	const handleDelete = async () => {
		await deleteLocationMutation.mutateAsync();
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm">
					Are you sure you want to delete{" "}
					<span className="font-semibold text-foreground">
						"{location.name}"
					</span>
					?
				</p>
				<p className="text-muted-foreground text-sm">
					This action cannot be undone. This will permanently delete the
					location and remove all associated data.
				</p>
			</div>

			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={() => {
						closeDialog();
						if (onClose) onClose();
					}}
					disabled={deleteLocationMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={handleDelete}
					disabled={deleteLocationMutation.isPending}
				>
					{deleteLocationMutation.isPending ? "Deleting..." : "Delete Location"}
				</Button>
			</div>
		</div>
	);
}
