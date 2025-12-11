"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDialog } from "@/hooks/use-dialog";
import { createItemCategory } from "@/lib/api/item-category";

export function CategoryFormContent() {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const [name, setName] = useState("");
	const [active, setActive] = useState(true);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const createMutation = useMutation({
		mutationFn: createItemCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["item-categories"] });
			toast.success("Category created successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to create category", {
				description: error.message,
			});
		},
	});

	const isPending = createMutation.isPending;

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!name.trim()) {
			newErrors.name = "Name is required";
		} else if (name.length > 100) {
			newErrors.name = "Name is too long (max 100 characters)";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		createMutation.mutate({
			name: name.trim(),
			active,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">
					Name <span className="text-destructive">*</span>
				</Label>
				<Input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Enter category name"
					disabled={isPending}
				/>
				{errors.name && (
					<p className="text-destructive text-sm">{errors.name}</p>
				)}
			</div>

			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label htmlFor="active">Active</Label>
					<p className="text-muted-foreground text-sm">
						Inactive categories won't be available for selection
					</p>
				</div>
				<Switch
					id="active"
					checked={active}
					onCheckedChange={setActive}
					disabled={isPending}
				/>
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
				<Button type="submit" disabled={isPending}>
					{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Create
				</Button>
			</div>
		</form>
	);
}
