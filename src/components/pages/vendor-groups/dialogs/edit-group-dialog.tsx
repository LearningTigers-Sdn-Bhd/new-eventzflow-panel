"use client";

import { useState, useEffect } from "react";
import { useUpdateGroup } from "@/hooks/use-groups";
import type { Group } from "@/lib/api/group";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditGroupDialogProps {
	group: Group;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditGroupDialog({
	group,
	open,
	onOpenChange,
}: EditGroupDialogProps) {
	const [name, setName] = useState(group.name);
	const [description, setDescription] = useState(group.description || "");
	const updateGroup = useUpdateGroup();

	useEffect(() => {
		setName(group.name);
		setDescription(group.description || "");
	}, [group]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await updateGroup.mutateAsync({
				id: group.id,
				data: {
					name,
					description: description || undefined,
				},
			});
			toast.success("Group updated successfully");
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to update group");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Group</DialogTitle>
					<DialogDescription>
						Update the group name and description.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Group Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter group name"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description (Optional)</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Enter group description"
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={updateGroup.isPending}>
							{updateGroup.isPending ? "Updating..." : "Update Group"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
