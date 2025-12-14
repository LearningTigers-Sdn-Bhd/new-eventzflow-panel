"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeEventExhibitionContractor } from "@/lib/api/event-exhibition-contractor";

interface RemoveContractorDialogProps {
	eventId: number;
	contractorName: string;
	onClose?: () => void;
}

export function RemoveContractorDialog({
	eventId,
	contractorName,
	onClose,
}: RemoveContractorDialogProps) {
	const queryClient = useQueryClient();

	// Remove contractor mutation
	const removeMutation = useMutation({
		mutationFn: () => removeEventExhibitionContractor(eventId),
		onSuccess: () => {
			toast.success("Exhibitor contractor removed successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", String(eventId), "exhibition-contractor"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove contractor");
		},
	});

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-4">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
					<AlertTriangle className="h-5 w-5 text-destructive" />
				</div>
				<div className="space-y-2">
					<p className="text-sm">
						Are you sure you want to remove <strong>{contractorName}</strong>{" "}
						from this event?
					</p>
					<p className="text-muted-foreground text-sm">
						This action will unassign the exhibitor contractor from this event.
						The exhibitor kit feature may also be disabled.
					</p>
				</div>
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button variant="outline" onClick={onClose} className="rounded-none">
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={() => removeMutation.mutate()}
					disabled={removeMutation.isPending}
					className="rounded-none"
				>
					{removeMutation.isPending && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					Remove Contractor
				</Button>
			</div>
		</div>
	);
}
