"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteGroup } from "@/hooks/use-groups";
import type { Group } from "@/lib/api/group";

interface DeleteGroupDialogProps {
	group: Group;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DeleteGroupDialog({
	group,
	open,
	onOpenChange,
}: DeleteGroupDialogProps) {
	const deleteGroup = useDeleteGroup();

	const handleDelete = async () => {
		try {
			await deleteGroup.mutateAsync(group.id);
			toast.success("Group deleted successfully");
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to delete group");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Group</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{group.name}"? This action cannot
						be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteGroup.isPending}
					>
						{deleteGroup.isPending ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
