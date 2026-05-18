"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useDeleteVisitor } from "@/hooks/use-visitors";
import type { Visitor } from "@/lib/api/visitor";

interface DeleteVisitorDialogProps {
	visitor: Visitor;
}

export function DeleteVisitorDialog({ visitor }: DeleteVisitorDialogProps) {
	const { closeDialog } = useDialog();
	const deleteMutation = useDeleteVisitor();

	const handleDelete = () => {
		deleteMutation.mutate(
			{
				eventId: visitor.event_id,
				visitorId: visitor.id,
			},
			{
				onSuccess: () => {
					toast.success("Visitor deleted successfully");
					closeDialog();
				},
				onError: (error: Error) => {
					toast.error("Failed to delete visitor", {
						description: error.message,
					});
				},
			},
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-4">
				<div className="rounded-full bg-destructive/10 p-3">
					<AlertTriangle className="h-6 w-6 text-destructive" />
				</div>
				<div className="space-y-2">
					<p className="text-sm">
						Are you sure you want to delete{" "}
						<span className="font-semibold">{visitor.full_name}</span>?
					</p>
					<p className="text-muted-foreground text-sm">
						This action cannot be undone. This will permanently delete the
						visitor and remove all associated data including stamps and scan
						logs.
					</p>
				</div>
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={deleteMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={handleDelete}
					disabled={deleteMutation.isPending}
				>
					{deleteMutation.isPending && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					Delete
				</Button>
			</div>
		</div>
	);
}
